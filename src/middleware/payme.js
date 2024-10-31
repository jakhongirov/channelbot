require('dotenv').config();
const base64 = require("base-64");

module.exports = {
   PAYME_CHECK_TOKEN: async (req, res, next) => {
      try {
         const { id } = req.body;
         const authHeader = req.headers.authorization;
         const token = authHeader && authHeader.split(" ")[1];
         if (!token) {
            return res.json({
               error: {
                  name: "InvalidAuthorization",
                  code: -32504,
                  message: {
                     uz: "Avtorizatsiya yaroqsiz",
                     ru: "Авторизация недействительна",
                     en: "Authorization invalid",
                  },
               },
               id: id
            })
         };

         const data = base64.decode(token);
         console.log(data)
         console.log(process.env.PAYME_KEY)
         console.log(data.includes(process.env.PAYME_KEY))

         if (!data.includes(process.env.PAYME_KEY)) {
            return res.json({
               error: {
                  name: "InvalidAuthorization",
                  code: -32504,
                  message: {
                     uz: "Avtorizatsiya yaroqsiz",
                     ru: "Авторизация недействительна",
                     en: "Authorization invalid",
                  },
               },
               id: id
            })
         }

         next();
      } catch (err) {
         next(err);
      }
   },

   PAYME_ERROR: (error, req, res, next) => {
      // Logger
      console.log(error);

      // Responder
      if (error.isTransactionError) {
         return res.json({
            error: {
               code: error.transactionErrorCode,
               message: error.transactionErrorMessage,
               data: error.transactionData,
            },
            id: error.transactionId,
         });
      }

      res.status(error.statusCode || 500).json({
         error,
      });
   }
}