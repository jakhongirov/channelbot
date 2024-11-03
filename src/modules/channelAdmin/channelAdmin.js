const model = require('./model')

module.exports = {
   GET: async (req, res) => {
      try {
         const channelAdmin = await model.channelAdmin()

         if (channelAdmin) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: channelAdmin
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

   ADD_ADMIN: async (req, res) => {
      try {
         const {
            title,
            username
         } = req.body

         const addAdmin = await model.addAdmin(title, username)

         if (addAdmin) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: addAdmin
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

   EDIT_ADMIN: async (req, res) => {
      try {
         const {
            id,
            username
         } = req.body

         const editAdmin = await model.editAdmin(id, username)

         if (editAdmin) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: editAdmin
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