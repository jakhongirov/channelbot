const express = require("express")
const router = express.Router()

//Middlawares
const {
   AUTH
} = require('../middleware/auth')
const FileUpload = require('../middleware/multer')

// files
const admin = require('./admin/admin')
const payment = require('./payment/payment')
const price = require('./price/price')
const users = require('./users/users')
const transaction = require('./transaction/transaction')
const channelAdmin = require('./channelAdmin/channelAdmin')

router

   // ADMIN API
   .get('/admin/list', AUTH, admin.GET_ADMIN)
   .post('/admin/register', admin.REGISTER_ADMIN)
   .post('/admin/login', admin.LOGIN_ADMIN)
   .put('/admin/edit', AUTH, admin.EDIT_ADMIN)
   .delete('/admin/delete', AUTH, admin.DELETE_ADMIN)

   //  PAYMENT
   .get('/token', payment.GET_TOKEN)
   .post('/add-card/:chat_id', payment.ADD_CARD)
   .post('/opt/:chat_id', payment.OTP)
   .post('/remove-card', payment.REMOVE_CARD)

   // PRICE
   .get('/prices', AUTH, price.GET)
   .post('/price/add', AUTH, price.ADD_PRICE)
   .put('/price/edit', AUTH, price.EDIT_PRICE)

   // USERS
   .get('/users/list', AUTH, users.GET)

   // TRANSACTION
   .get('/transactions/list', AUTH, transaction.GET)
   .get('/transactions/filter', AUTH, transaction.GET_FILTER)
   .get('/transactions/user', AUTH, transaction.GET_USER_ID)
   .post('/transaction/add', AUTH, transaction.ADD_TRANSACTION)

   .get('/channel-admin', AUTH, channelAdmin.GET)
   .post('/channel-admin/add', AUTH, channelAdmin.ADD_ADMIN)
   .put('/channel-admin/edit', AUTH, channelAdmin.EDIT_ADMIN)

module.exports = router