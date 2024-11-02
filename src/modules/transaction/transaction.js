const model = require('./model')

module.exports = {
   GET: async (req, res) => {
      try {
         const {
            limit,
            page
         } = req.query

         if (limit && page) {
            const transactions = await model.transaction(limit, page)

            if (transactions?.length > 0) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: transactions
               })
            } else {
               return res.status(404).json({
                  status: 404,
                  message: "Not found"
               })
            }

         } else {
            return res.status(400).json({
               status: 400,
               message: "Bad request"
            })
         }

      } catch (error) {
         console.log(error);
         return res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   },

   GET_FILTER: async (req, res) => {
      try {
         const {
            limit,
            page,
            month,
            year
         } = req.query

         if (limit && page) {
            const transactionsFilter = await model.transactionsFilter(
               limit,
               page,
               month,
               year
            )
            const totalAmount = await model.transactionsAmount(month, year)

            if (transactionsFilter?.length > 0) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: transactionsFilter,
                  total: totalAmount
               })
            } else {
               return res.status(404).json({
                  status: 404,
                  message: "Not found"
               })
            }
         } else {
            return res.status(400).json({
               status: 400,
               message: "Bad request"
            })
         }

      } catch (error) {
         console.log(error);
         return res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   },

   GET_USER_ID: async (req, res) => {
      try {
         const {
            user_id
         } = req.query

         const transactionsUserId = await model.transactionsUserId(user_id)

         if (transactionsUserId?.length > 0) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: transactionsUserId
            })
         } else {
            return res.status(404).json({
               status: 404,
               message: "Not found"
            })
         }

      } catch (error) {
         console.log(error);
         return res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   },

   ADD_TRANSACTION: async (req, res) => {
      try {
         const {
            user_id,
            method,
            amount
         } = req.body

         const addTransaction = await model.addTransaction(
            user_id,
            method,
            amount
         )

         if (addTransaction) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: addTransaction
            })
         } else {
            return res.status(404).json({
               status: 404,
               message: "Not found"
            })
         }
      } catch (error) {
         console.log(error);
         return res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   }
}