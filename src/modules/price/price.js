const model = require('./model')

module.exports = {
   GET: async (_, res) => {
      try {
         const price = await model.price()

         if (price?.length > 0) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: price
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

   ADD_PRICE: async (req, res) => {
      try {
         const {
            name,
            price
         } = req.body

         const addPrice = await model.addPrice(name, price)

         if (addPrice) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: addPrice
            })
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

   EDIT_PRICE: async (req, res) => {
      try {
         const {
            id,
            price
         } = req.body

         const editPrice = await model.editPrice(id, price)

         if (editPrice) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: editPrice
            })
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
   }
}