const model = require('./model')
const atmos = require('../atmos/atmos')
const { bot } = require('../bot')

const pay = async (user, userCard) => {
   const atmosToken = await model.atmosToken()
   const price = await model.price()

   const createPay = await atmos.createPay(
      price?.price,
      user?.chat_id,
      atmosToken?.token,
      atmosToken?.expires
   )

   console.log(createPay)

   if (createPay?.result?.code == "OK") {
      const preApply = await atmos.preApply(
         userCard?.card_token,
         createPay?.transaction_id,
         atmosToken?.token,
         atmosToken?.expires
      )
      console.log(preApply)

      if (preApply?.result?.code == "OK") {
         const apply = await atmos.apply(
            createPay?.transaction_id,
            atmosToken?.token,
            atmosToken?.expires
         )
         console.log(apply)


         if (apply?.result?.code == "OK") {
            const addCheck = await model.addCheck(
               user?.chat_id,
               apply?.store_transaction?.success_trans_id,
               "CARD",
               apply?.store_transaction?.amount,
               createPay?.transaction_id,
               apply?.ofd_url
            )

            const currentDate = new Date();
            const expirationDate = new Date(currentDate);
            expirationDate.setMonth(expirationDate.getMonth() + 1);
            const expirationTimestamp = Math.floor(expirationDate.getTime() / 1000);
            const editUserExpired = await model.editUserExpired(user?.chat_id, expirationTimestamp)

            if (addCheck && editUserExpired) {
               return "Success"
            }
         } else {
            console.log(apply)
            return "Error"
         }
      } else {
         console.log(preApply)
         return "Error"

      }
   } else {
      console.log(createPay)
      return "Error"
   }
}

const sendMessageBefore = async () => {
   try {
      const getUsersBefore2day = await model.getUsersBefore2day()
      const getUsersBefore1day = await model.getUsersBefore1day()

      if (getUsersBefore2day?.length > 0) {
         for (const user of getUsersBefore2day) {
            bot.sendMessage(user?.chat_id, "Sizning obunangiz tugashiga 2 kun qoldi")
         }
      }

      if (getUsersBefore1day?.length > 0) {
         for (const user of getUsersBefore1day) {
            bot.sendMessage(user?.chat_id, "Sizning obunangiz tugashiga 1 kun qoldi. Ertaga oxirgi kun kartada pul yechib olinadi")
         }
      }
   } catch (error) {
      console.log(error)
   }
}

const paySubcribe = async () => {
   try {
      const getUsers = await model.getUsers()
      const getUsersAfter2days = await model.getUsersAfter2days()
      const getUsersAfter1days = await model.getUsersAfter1days()
      const getUserWithoutDuration = await model.getUserWithoutDuration()

      if (getUsers?.length > 0) {
         for (const user of getUsers) {
            const userCards = await model.userCards(user?.chat_id);
            let success = false; // Flag to track successful payment for the current user

            for (const card of userCards) {
               if (success) break; // Skip further cards if payment was successful

               const payed = await pay(user, card);

               if (payed == 'Success') {
                  console.log(`Payment successful for user ${user.chat_id} with card ${card}`);
                  success = true; // Set success to true to stop further processing for this user
               }
            }

            if (!success) {
               bot.sendMessage(user?.chat_id, "Xatolik yuz berdi to'lov qabul qilinmadi.")
               bot.banChatMember(process.env.CHANNEL_ID, user?.chat_id)
                  .then(async () => {
                     console.log(`User with ID ${user?.chat_id} has been removed `);
                     await model.editUserSubcribe(user?.chat_id, false)
                  })
                  .catch(err => console.error('Error removing user:', err));
               console.log(`No successful payment for user ${user.chat_id}`);
            }
         }
      }

      if (getUsersAfter1days?.length > 0) {
         for (const user of getUsersAfter1days) {
            const userCards = await model.userCards(user?.chat_id);
            let success = false; // Flag to track successful payment for the current user

            for (const card of userCards) {
               if (success) break; // Skip further cards if payment was successful

               const payed = await pay(user, card);
               console.log(payed)

               if (payed === 'Success') {
                  console.log(`Payment successful for user ${user.chat_id} with card ${card}`);
                  success = true; // Set success to true to stop further processing for this user
               }
            }

            if (!success) {
               console.log(`No successful payment for user ${user.chat_id}`);
               bot.sendMessage(user?.chat_id, "Xatolik yuz berdi to'lov qabul qilinmadi.")
            }
         }
      }

      if (getUsersAfter2days?.length > 0) {
         for (const user of getUsersAfter2days) {
            const userCards = await model.userCards(user?.chat_id);
            let success = false; // Flag to track successful payment for the current user

            for (const card of userCards) {
               if (success) break; // Skip further cards if payment was successful

               const payed = await pay(user, card);

               if (payed === 'Success') {
                  console.log(`Payment successful for user ${user.chat_id} with card ${card}`);
                  success = true; // Set success to true to stop further processing for this user
                  bot.sendMessage(user?.chat_id, "Tolov muvaffaqiyatli qabul qilindi")
               }
            }

            if (!success) {
               console.log(`No successful payment for user ${user.chat_id}`);
               bot.sendMessage(user?.chat_id, "Xatolik yuz berdi to'lov qabul qilinmadi.")
               bot.banChatMember(process.env.CHANNEL_ID, user?.chat_id)
                  .then(async () => {
                     console.log(`User with ID ${user?.chat_id} has been removed `);
                     await model.editUserSubcribe(user?.chat_id, false)
                  })
                  .catch(err => console.error('Error removing user:', err));
            }
         }
      }

      if (getUserWithoutDuration?.length > 0) {
         for (const user of getUserWithoutDuration) {
            bot.sendMessage(user?.chat_id, "Obunangiz tugadi")
            bot.banChatMember(process.env.CHANNEL_ID, user?.chat_id)
               .then(async () => {
                  console.log(`User with ID ${user?.chat_id} has been removed `);
                  await model.editUserSubcribe(user?.chat_id, false)
               })
               .catch(err => console.error('Error removing user:', err));
         }
      }


   } catch (error) {
      console.log(error)
   }
}

module.exports = {
   sendMessageBefore,
   paySubcribe,
   pay
}