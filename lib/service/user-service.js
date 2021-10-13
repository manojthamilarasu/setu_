let SplitWiseManager = require('../manager/splitwise-manager')
let uuid = require('uuid')
let Errors = require('../common/Errors')
class UserService {
  constructor() {
    this.splitWiseManager = new SplitWiseManager()
  }



  async createUser(payload) {
    const me = this;
    try {
      payload.owe = {}
      payload.recieve = {}
      let response = await me.splitWiseManager.createUser(payload);
      return response
    } catch (err) {
      throw err;
    }

  }

  async createExpense(payload) {
    const me = this;
    try {
      let response = await me.splitWiseManager.createExpense(payload);
      return response
    } catch (err) {
      throw err;
    }

  }

  async settlement(payload) {
    const me = this;
    try {
      let response = await me.splitWiseManager.settlement(payload);
      return response
    } catch (err) {
      throw err;
    }

  }

  async getBalanceOfUser(userId) {
    const me = this;
    try {
      let response = await me.splitWiseManager.getBalanceOfUser(userId);
      return response
    } catch (err) {
      throw err;
    }

  }

  async getTransactionsOfUser(userId){
    const me = this;
    try{
      let response = await me.splitWiseManager.getTransactionsOfUser(userId);
      return response
    }catch(err){

    }
  }
}
module.exports = UserService