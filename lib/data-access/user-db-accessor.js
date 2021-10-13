'use strict';
let BaseDbAccessor = require("./base-db-accessor");
const pgp = require('pg-promise')();
let uuid = require('uuid');
let Enum = require("../common/Enum");


class UsersDbAccessor extends BaseDbAccessor {
  constructor() {
    super()
    this.table = Enum.Tables.users;
  }

  async createUser(payload) {
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

  async getUser(id) {
    const me = this;
    try {
      let query = `SELECT * FROM users where id=$1;`;
      return await me.executeQuery(query, [id])

    }
    catch (err) {
      throw err;
    }
  }

  async updateUserInfo(id, data) {
    const me = this;
    try {
      let query = `UPDATE ${this.table} SET data = $2, modified_date = current_timestamp where id = $1;`;
      return await me.executeQuery(query, [id, data])
    } catch (err) {
      throw err
    }
  }

  async getBalanceOfUser(id) {
    const me = this;
    try {
      let query = `SELECT data->'recieve' AS receive,data->'owe' AS owe FROM users where id=$1;`;
      return await me.executeQuery(query, [id])
    } catch (err) {
      throw err
    }
  }

}
module.exports = UsersDbAccessor;