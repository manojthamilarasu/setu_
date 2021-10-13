let UserDBAcessor = require("../data-access/user-db-accessor")
let ExpenseDBAcessor = require("../data-access/expense-db-accessor")
let TransactionDBAccessor = require("../data-access/transaction-db-accessor")
const geofire = require('geofire-common');
let _ = require('lodash');
let Enum = require('../common/Enum');
let Errors = require('../common/Errors');

class SplitWiseManager {
  constructor() {
    this.userDbAccessor = new UserDBAcessor()
    this.expenseDbAccessor = new ExpenseDBAcessor()
    this.transactionDBAccessor = new TransactionDBAccessor()
  }



  async createUser(payload) {
    const me = this;
    try {
      return await me.userDbAccessor.createUser(payload)
    } catch (err) {
      throw err
    }
  }


  splitPayments(payments, totalCost, type, options) {
    const people = Object.keys(payments);
    const valuesPaid = Object.values(payments);

    const sum = valuesPaid.reduce((acc, curr) => curr + acc);
    if (sum != totalCost) {
      throw Errors.CostMisMatch
    }
    let sortedValuesPaid, sortedPeople, mean
    if (type == Enum.ExpenseType.Equal) {
      mean = sum / people.length;

      sortedPeople = people.sort((personA, personB) => payments[personA] - payments[personB]);
      sortedValuesPaid = sortedPeople.map((person) => payments[person] - mean);
    }
    else if (type == Enum.ExpenseType.Exact) {
      let exactSplit = options.exact_split
      sortedPeople = people.sort((personA, personB) => payments[personA] - payments[personB]);
      sortedValuesPaid = sortedPeople.map((person) => payments[person] - exactSplit[person]);
    }
    else if (type == Enum.ExpenseType.Percentage) {
      let percentangeSplit = options.percentage_split
      sortedPeople = people.sort((personA, personB) => payments[personA] - payments[personB]);
      sortedValuesPaid = sortedPeople.map((person) => payments[person] - percentangeSplit[person]);
    }

    let i = 0;
    let j = sortedPeople.length - 1;
    let debt;
    let consolidation = {}
    while (i < j) {
      debt = Math.min(-(sortedValuesPaid[i]), sortedValuesPaid[j]);
      sortedValuesPaid[i] += debt;
      sortedValuesPaid[j] -= debt;
      consolidation[sortedPeople[i]] = consolidation[sortedPeople[i]] || []
      consolidation[sortedPeople[i]].push({
        to: sortedPeople[j],
        debt: debt
      })
      console.log(`${sortedPeople[i]} owes ${sortedPeople[j]} Rs.${debt}`);

      if (sortedValuesPaid[i] === 0) {
        i++;
      }

      if (sortedValuesPaid[j] === 0) {
        j--;
      }
    }
    return consolidation
  }

  /* 
    Create an expense and calculate the user's amout top be owed and recieved
  */
  async createExpense(payload) {
    const me = this;
    /* Need to check if user specified is actually present */
    try {
      let consolidatedSplit, options = {}
      let users = _.keys(payload.splits)
      switch (payload.type) {
        case Enum.ExpenseType.Equal:
          consolidatedSplit = this.splitPayments(payload.splits, payload.total_cost, payload.type)
          break;
        case Enum.ExpenseType.Exact:
          options = {}
          options.exact_split = payload.exact_split
          consolidatedSplit = this.splitPayments(payload.splits, payload.total_cost, payload.type, options)
          break;
        case Enum.ExpenseType.Percentage:
          options = {}
          let percentageSplit = payload.percentage_split
          let users = _.keys(percentageSplit)
          for (let userPercentage of users) {
            let amount = payload.total_cost * (percentageSplit[userPercentage] / 100)
            percentageSplit[userPercentage] = amount
          }
          options.percentage_split = percentageSplit
          consolidatedSplit = this.splitPayments(payload.splits, payload.total_cost, payload.type, options)
          break;
      }

      let recieve = {}



      /*Consoleidate recieve amount*/

      _.forEach(consolidatedSplit, function (data, key) {
        for (let details of data) {
          recieve[details.to] = recieve[details.to] || []
          recieve[details.to].push({
            from: key,
            amount: details.debt
          })
        }
      })

      payload.owe = consolidatedSplit

      /* 
          create an expense 
          update users' data accordingly
      */

      await me.expenseDbAccessor.createExpense(payload)


      for (let user of users) {
        let flag = false
        let userDetails = await me.userDbAccessor.getUser(user)
        if (userDetails.length)
          userDetails = userDetails[0].data
        if (recieve[user]) {
          flag = true
          for (let recievers of recieve[user]) {
            userDetails.recieve[recievers.from] = userDetails.recieve[recievers.from] || 0
            userDetails.recieve[recievers.from] += recievers.amount
          }
        }
        if (consolidatedSplit[user]) {
          flag = true
          for (let owe of consolidatedSplit[user]) {
            userDetails.owe[owe.to] = userDetails.owe[owe.to] || 0
            userDetails.owe[owe.to] += owe.debt
          }

        }
        if (flag) {
          await me.userDbAccessor.updateUserInfo(user, userDetails)
        }
      }
      return 'Success'
    } catch (err) {
      throw err
    }
  }

  async settlement(payload) {
    /* only existing user shud be sent*/
    const me = this;
    let fromUser = payload.from
    let toUser = payload.to

    let toUserDetails = await me.userDbAccessor.getUser(toUser)
    toUserDetails = toUserDetails[0].data
    let fromUserDetails = await me.userDbAccessor.getUser(fromUser)
    fromUserDetails = fromUserDetails[0].data
    let recieveAmount = toUserDetails.recieve[fromUser]

    /* Handling the case where the person sends amount greater than he owe */
    if (recieveAmount && recieveAmount != 0) {
      if (recieveAmount < payload.amount) {
        toUserDetails.recieve[fromUser] = 0
        fromUserDetails.recieve[toUser] = payload.amount - recieveAmount
        fromUserDetails.owe[toUser] = 0
        await me.userDbAccessor.updateUserInfo(toUser, toUserDetails)
        await me.userDbAccessor.updateUserInfo(fromUser, fromUserDetails)
      } else {
        toUserDetails.recieve[fromUser] -= payload.amount
        fromUserDetails.owe[toUser] -= payload.amount
        await me.userDbAccessor.updateUserInfo(toUser, toUserDetails)
        await me.userDbAccessor.updateUserInfo(fromUser, fromUserDetails)
      }

      return await me.transactionDBAccessor.logTransaction(payload)
    }
    return 'No settlement required'
  }


  async getBalanceOfUser(userId) {
    const me = this;
    try {
      return await me.userDbAccessor.getBalanceOfUser(userId)
    } catch (e) {
      throw e
    }
  }

  async getTransactionsOfUser(userId) {
    const me = this;
    try {
      let transactions = await me.transactionDBAccessor.getTransactionsOfUser(userId);

      let recieve = [];
      let owe = []
      for (let transaction of transactions) {
        transaction.data.created_date = transaction.created_date
        if (transaction.data.to == userId) {
          recieve.push(transaction.data)
        } else {
          owe.push(transaction.data)
        }
      }
      return { owe, recieve }
    } catch (e) {
      throw e
    }
  }


}
module.exports = SplitWiseManager;

