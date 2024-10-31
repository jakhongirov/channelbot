const express = require("express")
const router = express.Router()

//Middlawares
const { AUTH } = require('../middleware/auth')
const FileUpload = require('../middleware/multer')

// files
const payment = require('./payment/payment')

router
   .get('/token', payment.GET_TOKEN)
   .post('/add-card/:chat_id', payment.ADD_CARD)
   .post('/opt/:chat_id', payment.OPT)

module.exports = router