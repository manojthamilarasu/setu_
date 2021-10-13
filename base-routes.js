let RouteHandler = require('./lib/base-route-handler')
const ApiSchema = require('./lib/schema/api-schema')

class Baseroutes {

  constructor() {
    this.routeHandler = new RouteHandler()
  }

  PublicRoutes() {
    return [{
      method: 'POST',
      path: '/create-user',
      options: {
        description: 'Create User',
        validate: {
          payload: ApiSchema.createuser
        }
      },
      handler: (request, reply) => {
        return this.routeHandler.createUser(request.payload, reply)
      }

    },
    {
      method: 'POST',
      path: '/create-expense',
      options: {
        description: 'Create and calculate expense',
        validate: {
          payload: ApiSchema.createExpense
        }
      },
      handler: (request, reply) => {
        return this.routeHandler.createExpense(request.payload, reply)
      }

    },
    {
      method: 'POST',
      path: '/settlement',
      options: {
        description: 'settle the money a user owes',
        validate: {
          payload: ApiSchema.settlement
        }
      },
      handler: (request, reply) => {
        return this.routeHandler.settlement(request.payload, reply)
      }
    },
    {
      method: 'GET',
      path: '/balance/{user_id}',
      options: {
        description: 'get user balance',
      },
      handler: (request, reply) => {
        return this.routeHandler.getBalanceOfUser(request.params.user_id, reply)
      }
    },
    {
      method: 'GET',
      path: '/transaction/{user_id}',
      options: {
        description: 'get user balance',
      },
      handler: (request, reply) => {
        return this.routeHandler.getTransactionsOfUser(request.params.user_id, reply)
      }
    }
    ]
  }
}

module.exports = Baseroutes

