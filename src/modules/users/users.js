const model = require('./model')

module.exports = {
   GET: async (req, res) => {
      try {
         const {
            limit,
            page,
            phone
         } = req.query

         if (limit && page) {
            const users = await model.users(limit, page, phone)

            if (users?.length > 0) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: users
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
   }
}