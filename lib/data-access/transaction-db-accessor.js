'use strict';
let BaseDbAccessor = require("./base-db-accessor");
let uuid = require('uuid');
let Enum = require("../common/Enum");


class TrasactionDbAccessor extends BaseDbAccessor {
  constructor() {
    super()
    this.table = Enum.Tables.transactions;
  }


  async logTransaction(payload) {
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

  async getTransactionsOfUser(id){
    const me = this;
    try {
      let query = `SELECT * from transactions where data->>'to'=$1 OR data->>'from'=$1;`;
      return await me.executeQuery(query, [id])
    }
    catch (err) {
      throw err;
    }
  }

}
module.exports = TrasactionDbAccessor;