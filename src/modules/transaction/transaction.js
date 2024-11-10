const model = require('./model')

function monthToCurrentDate(expire_month) {
   const date = new Date();
   date.setMonth(date.getMonth() + 1);

   const year = date.getUTCFullYear();
   const month = String(date.getUTCMonth() + Number(expire_month)).padStart(2, '0');
   const day = String(date.getUTCDate()).padStart(2, '0');

   return `${year}-${month}-${day}`;
}

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

   TOTAL_AMOUNT: async (req, res) => {
      try {
         const totalAmount = await model.totalAmount()

         return res.status(200).json({
            status: 200,
            message: "Success",
            data: totalAmount
         })

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

   GET_ID: async (req, res) => {
      try {
         const {
            id
         } = req.params
         const foundTransaction = await model.foundTransaction(id)

         if (foundTransaction) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: foundTransaction
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
            amount,
            month
         } = req.body
         const foundUser = await model.foundUser(user_id)

         if (foundUser) {
            const expiredDate = monthToCurrentDate(month)
            const addTransaction = await model.addTransaction(
               user_id,
               method,
               amount
            )
            const editExpired = await model.expiredDate(user_id, expiredDate)

            if (addTransaction && editExpired) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: addTransaction
               })
            } else {
               return res.status(400).json({
                  status: 400,
                  message: "Bad request"
               })
            }
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

   GET_STATIS_MONTHS: async (req, res) => {
      try {
         const statisticsMonths = await model.statisticsMonths()

         return res.status(200).json({
            status: 200,
            message: "Success",
            data: statisticsMonths
         })

      } catch (error) {
         console.log(error);
         return res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   },

   GET_STATIS_INCREASE: async (req, res) => {
      try {
         const statisticsIncrease = await model.statisticsIncrease()

         return res.status(200).json({
            status: 200,
            message: "Success",
            data: statisticsIncrease
         })

      } catch (error) {
         console.log(error);
         return res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   }
}