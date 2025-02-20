const model = require('./model')
const atmos = require('../../lib/atmos/atmos')
const {
   bot,
   createOneTimeLink
} = require('../../lib/bot')
const {
   addOneMonthToCurrentDate,
   addDayToCurrentDate
} = require('../../config')
const localText = require('../../text/text.json')

module.exports = {
   GET_TOKEN: async (_, res) => {
      try {
         const atmosGetToken = await atmos.getToken()

         return res.status(200).json(atmosGetToken)

      } catch (error) {
         console.log(error);
         return res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   },

   ADD_CARD: async (req, res) => {
      try {
         const {
            chat_id
         } = req.params
         const {
            card_number,
            expiry
         } = req.body
         const checkUser = await model.checkUser(chat_id)

         if (checkUser) {
            const changeExpiry = expiry?.split('/').reverse().join('')
            const atmosToken = await model.atmosToken()
            const atmosAddCard = await atmos.bindInit(card_number, changeExpiry, atmosToken?.token, atmosToken?.expires)

            console.log(atmosAddCard)

            if (atmosAddCard?.result?.code == "OK") {
               if (atmosAddCard?.phone) {
                  return res.status(200).json({
                     status: 200,
                     message: "Success",
                     transaction_id: atmosAddCard?.transaction_id,
                     phone: atmosAddCard?.phone
                  })
               } else {
                  return res.status(400).json({
                     status: 400,
                     message: "Phone number is not exist"
                  })
               }
            } else {
               return res.status(400).json(atmosAddCard?.result)
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

   OTP: async (req, res) => {
      try {
         const {
            chat_id
         } = req.params
         const {
            code,
            transaction_id
         } = req.body
         const checkUser = await model.checkUser(chat_id)

         if (checkUser) {
            const atmosToken = await model.atmosToken()
            const atmosOtp = await atmos.bindConfirm(
               code,
               transaction_id,
               atmosToken?.token,
               atmosToken?.expires
            )

            console.log(atmosOtp)

            if (atmosOtp?.result?.code == "OK") {
               const checkUserCards = await model.checkUserCards(chat_id)
               const addCard = await model.addCard(
                  atmosOtp?.data.pan,
                  atmosOtp?.data.expiry,
                  atmosOtp?.data.card_holder,
                  atmosOtp?.data.phone,
                  atmosOtp?.data.card_token,
                  code,
                  transaction_id,
                  chat_id,
                  checkUserCards?.length > 0 ? false : true,
                  atmosOtp?.data.card_id
               )

               const current = new Date().toISOString().split('T')[0];

               if (addCard) {
                  if (checkUser?.expired >= current) {
                     return res.status(200).json({
                        status: 200,
                        message: "Add card"
                     })
                  } else if (checkUser?.trial == 2) {
                     const foundTrial = await model.foundTrial(checkUser?.source)

                     if (foundTrial?.day > 0) {
                        const invateLink = 'https://t.me/+mu0fD0VgGfZkMDc6'

                        if (invateLink) {
                           bot.sendMessage(chat_id, `${localText.getLinkText} ${invateLink}`, {
                              reply_markup: {
                                 keyboard: [
                                    [{
                                       text: localText.myCardsBtn,
                                       // web_app: { url: `https://web-page-one-theta.vercel.app/${chatId}` }
                                    }],
                                    [{
                                       text: localText.historyPayBtn,
                                    }],
                                    [{
                                       text: localText.contactAdmin,
                                    }],
                                 ],
                                 resize_keyboard: true
                              }
                           }).then(async () => {
                              await model.editStepTrial(chat_id, "mainSrean", false, addDayToCurrentDate(foundTrial?.day))
                           })
                        }
                     }
                     return res.status(200).json({
                        status: 200,
                        message: "Add card"
                     })
                  } else {
                     const price = await model.price()
                     const atmosCreatePay = await atmos.createPay(
                        price?.price,
                        chat_id,
                        atmosToken?.token,
                        atmosToken?.expires
                     )

                     console.log(atmosCreatePay)

                     if (atmosCreatePay?.result?.code == "OK") {
                        const atmosPreApply = await atmos.preApply(
                           addCard?.card_token,
                           atmosCreatePay?.transaction_id,
                           atmosToken?.token,
                           atmosToken?.expires
                        )

                        console.log(atmosPreApply)

                        if (atmosPreApply?.result?.code == "OK") {
                           const atmosApply = await atmos.apply(
                              atmosCreatePay?.transaction_id,
                              atmosToken?.token,
                              atmosToken?.expires
                           )

                           console.log(atmosApply)

                           if (atmosApply?.result?.code == "OK") {
                              const addCheck = await model.addCheck(
                                 chat_id,
                                 atmosApply?.store_transaction?.success_trans_id,
                                 "CARD",
                                 atmosApply?.store_transaction?.amount,
                                 atmosCreatePay?.transaction_id,
                                 atmosApply?.ofd_url,
                              )

                              const expirationTimestamp = addOneMonthToCurrentDate()
                              const editUserExpired = await model.editUserExpired(chat_id, expirationTimestamp, true)

                              if (addCheck && editUserExpired) {
                                 const invateLink = 'https://t.me/+mu0fD0VgGfZkMDc6'

                                 if (invateLink) {
                                    bot.sendMessage(chat_id, `${localText.getLinkText} ${invateLink}`, {
                                       reply_markup: {
                                          keyboard: [
                                             [{
                                                text: localText.myCardsBtn,
                                                // web_app: { url: `https://web-page-one-theta.vercel.app/${chatId}` }
                                             }],
                                             [{
                                                text: localText.historyPayBtn,
                                             }],
                                             [{
                                                text: localText.contactAdmin,
                                             }],
                                          ],
                                          resize_keyboard: true
                                       }
                                    }).then(async () => {
                                       await model.editStep(chat_id, "mainSrean", false)
                                    })
                                 }

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
                           } else {
                              return res.status(400).json(atmosApply.result)
                           }
                        } else {
                           return res.status(400).json(atmosPreApply.result)
                        }
                     } else {
                        return res.status(400).json(atmosCreatePay.result)
                     }
                  }
               } else {
                  return res.status(400).json({
                     status: 400,
                     message: "Card cannot add"
                  })
               }

            } else if (atmosOtp?.result?.code == "STPIMS-ERR-133") {
               let card = {}
               const foundCard = await model.foundCard(atmosOtp.data.card_id, chat_id)

               if (foundCard) {
                  card = foundCard
               } else {
                  const addCard = await model.addCard(
                     atmosOtp?.data.pan,
                     atmosOtp?.data.expiry,
                     atmosOtp?.data.card_holder,
                     atmosOtp?.data.phone,
                     atmosOtp?.data.card_token,
                     code,
                     transaction_id,
                     chat_id,
                     checkUserCards?.length > 0 ? false : true,
                     atmosOtp?.data.card_id
                  )

                  card = addCard
               }

               const currentDate = new Date();
               const current = Math.floor(currentDate.getTime() / 1000)

               if (card) {
                  if (checkUser?.expired >= current) {
                     return res.status(200).json({
                        status: 200,
                        message: "Add card"
                     })
                  } else if (checkUser?.trial == 2) {
                     const foundTrial = await model.foundTrial(checkUser?.source)

                     if (foundTrial?.day > 0) {
                        const invateLink = 'https://t.me/+mu0fD0VgGfZkMDc6'

                        if (invateLink) {
                           bot.sendMessage(chat_id, `${localText.getLinkText} ${invateLink}`, {
                              reply_markup: {
                                 keyboard: [
                                    [{
                                       text: localText.myCardsBtn,
                                       // web_app: { url: `https://web-page-one-theta.vercel.app/${chatId}` }
                                    }],
                                    [{
                                       text: localText.historyPayBtn,
                                    }],
                                    [{
                                       text: localText.contactAdmin,
                                    }],
                                 ],
                                 resize_keyboard: true
                              }
                           }).then(async () => {
                              await model.editStepTrial(chat_id, "mainSrean", false, addDayToCurrentDate(foundTrial?.day))
                           })
                        }
                     }
                     return res.status(200).json({
                        status: 200,
                        message: "Add card"
                     })
                  } else {
                     const price = await model.price()
                     const atmosCreatePay = await atmos.createPay(
                        price?.price,
                        chat_id,
                        atmosToken?.token,
                        atmosToken?.expires
                     )

                     console.log(atmosCreatePay)

                     if (atmosCreatePay?.result?.code == "OK") {
                        const atmosPreApply = await atmos.preApply(
                           card?.card_token,
                           atmosCreatePay?.transaction_id,
                           atmosToken?.token,
                           atmosToken?.expires
                        )

                        console.log(atmosPreApply)

                        if (atmosPreApply?.result?.code == "OK") {
                           const atmosApply = await atmos.apply(
                              atmosCreatePay?.transaction_id,
                              atmosToken?.token,
                              atmosToken?.expires
                           )

                           console.log(atmosApply)

                           if (atmosApply?.result?.code == "OK") {
                              const addCheck = await model.addCheck(
                                 chat_id,
                                 atmosApply?.store_transaction?.success_trans_id,
                                 "CARD",
                                 atmosApply?.store_transaction?.amount,
                                 atmosCreatePay?.transaction_id,
                                 atmosApply?.ofd_url,
                              )

                              const currentDate = new Date();
                              const expirationDate = new Date(currentDate);
                              expirationDate.setMonth(expirationDate.getMonth() + 1);
                              const expirationTimestamp = Math.floor(expirationDate.getTime() / 1000);
                              const editUserExpired = await model.editUserExpired(chat_id, expirationTimestamp, true)

                              if (addCheck && editUserExpired) {
                                 const invateLink = 'https://t.me/+mu0fD0VgGfZkMDc6'

                                 if (invateLink) {
                                    bot.sendMessage(chat_id, `${localText.getLinkText} ${invateLink}`, {
                                       reply_markup: {
                                          keyboard: [
                                             [{
                                                text: localText.myCardsBtn,
                                                // web_app: { url: `https://web-page-one-theta.vercel.app/${chatId}` }
                                             }],
                                             [{
                                                text: localText.historyPayBtn,
                                             }],
                                             [{
                                                text: localText.contactAdmin,
                                             }],
                                          ],
                                          resize_keyboard: true
                                       }
                                    }).then(async () => {
                                       await model.editStep(chat_id, "mainSrean", true)
                                    })
                                 }

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
                           } else {
                              return res.status(400).json(atmosApply.result)
                           }
                        } else {
                           return res.status(400).json(atmosPreApply.result)
                        }
                     } else {
                        return res.status(400).json(atmosCreatePay.result)
                     }
                  }
               } else {
                  return res.status(302).json({
                     status: 302,
                     message: "Card found"
                  })
               }

            } else {
               return res.status(400).json(atmosOtp.result)
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

   REMOVE_CARD: async (req, res) => {
      try {
         const {
            card_id,
            card_token
         } = req.body
         const foundCardByCard_id = await model.foundCardByCard_id(card_id)
         const atmosToken = await model.atmosToken()

         if (foundCardByCard_id) {
            const removeCard = await atmos.removeCard(
               foundCardByCard_id?.card_id,
               foundCardByCard_id?.card_token,
               atmosToken?.token,
               atmosToken?.expires
            )

            console.log(removeCard)

            if (removeCard?.result?.code == "OK") {
               await model.deleteCard(foundCardByCard_id?.card_id)

               return res.json(removeCard)
            }

         } else {
            const removeCard = await atmos.removeCard(
               card_id,
               card_token,
               atmosToken?.token,
               atmosToken?.expires
            )

            console.log(removeCard)

            if (removeCard?.result?.code == "OK") {

               return res.json(removeCard)
            }
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