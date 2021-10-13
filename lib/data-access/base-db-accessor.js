
const pgp = require('pg-promise')();
pgp.pg.defaults.poolSize = 10;
const connection = {
  "host": "localhost",
  "port": 5432,
  "database": "ind_ecomorders_stub",
  "user": "postgres"
}

let db = pgp(connection)

class BaseDbAccessor {
  constructor() {
  }

  async executeQuery(query, values = []) {
    try {
      return await db.any(query, values)
    }
    catch (err) {
      throw err
    }
  }


}
module.exports = BaseDbAccessor;
