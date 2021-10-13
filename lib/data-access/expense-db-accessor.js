'use strict';
let BaseDbAccessor = require("./base-db-accessor");
const pgp = require('pg-promise')();
let uuid = require('uuid');
let Enum = require("../common/Enum");


class ExpenseDbAccessor extends BaseDbAccessor {
  constructor() {
    super()
    this.table = Enum.Tables.expense;
  }


  async createExpense(payload) {
    const me = this;
    try {
      let query = `INSERT INTO ${me.table} (id, data) VALUES ($1, $2);`;
      await me.executeQuery(query, [uuid.v4(), payload])
      return 'Success'
    }
    catch (err) {
      throw err;
    }
  }

}
module.exports = ExpenseDbAccessor;