const model = require('./model')

module.exports = {
   GET: async (req, res) => {
      try {
         const trail = await model.trail()

         if (trail?.length > 0) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: trail
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

   ADD_TRIAL: async (req, res) => {
      try {
         const {
            source,
            day
         } = req.body

         const addTrial = await model.addTrial(source, day)

         if (addTrial) {
            return res.status(200).json({
               status: 200,
               message: "Success"
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

   EDIT_TRAIL: async (req, res) => {
      try {
         const {
            id,
            source,
            day
         } = req.body

         const editTrail = await model.editTrail(id, source, day)

         if (editTrail) {
            return res.status(200).json({
               status: 200,
               message: "Success"
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

   DELETE_TRAIL: async (req, res) => {
      try {
         const {
            id
         } = req.body

         const deleteTrail = await model.deleteTrail(id)

         if (deleteTrail) {
            return res.status(200).json({
               status: 200,
               message: "Success"
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