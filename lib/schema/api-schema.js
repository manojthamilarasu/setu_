const joi = require('joi')

const createuser = joi.object({
  name: joi.string().required(),
  email: joi.string().optional(),
  contact: joi.string().optional()
})

const createExpense = joi.object({
  total_cost: joi.number().required(),
  type: joi.string().required(),
  splits: joi.object().required(),
  exact_split: joi.object().optional(),
  percentage_split:joi.object().optional()
})

const settlement = joi.object({
  from: joi.string().required(),
  to: joi.string().required(),
  amount: joi.number().required(),
  expense_id: joi.string().optional()
})

module.exports = {
  createuser,
  createExpense,
  settlement
}