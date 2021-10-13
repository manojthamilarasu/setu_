let userService = require('./service/user-service')
let Errors = require('./common/Errors')

class BaseRouteHandler {
  constructor() {
    this.userService = new userService()
  }

  replySuccess(h, message) {
    let statusCode = 200;
    if (message && message.statusCode) {
      statusCode = message.statusCode
    }
    return h.response(message).code(statusCode);
  }

  replyError(h, message) {
    let statusCode = 409;
    if (message && message.statusCode) {
      statusCode = message.statusCode
    }
    return h.response(message).code(statusCode);
  }


  async createUser(payload, reply) {
    try {
      return await this.userService.createUser(payload)
    } catch (err) {
      throw err;
    }
  }

  async createExpense(payload, reply) {
    try {
      return await this.userService.createExpense(payload)
    } catch (err) {
      return this.replyError(reply, err)
    }
  }

  async settlement(payload, reply) {
    try {
      return await this.userService.settlement(payload)
    } catch (err) {
      return this.replyError(reply, err)
    }
  }

  async getBalanceOfUser(userId, reply) {
    try {
      return await this.userService.getBalanceOfUser(userId)
    } catch (err) {
      return this.replyError(reply, err)
    }
  }

  async getTransactionsOfUser(userId, reply) {
    try {
      return await this.userService.getTransactionsOfUser(userId)
    } catch (err) {
      return this.replyError(reply, err)
    }
  }

}
module.exports = BaseRouteHandler