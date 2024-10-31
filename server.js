require('dotenv').config()
const express = require("express");
const cors = require("cors");
const path = require('path')
const fs = require('fs');
const app = express();
const router = require("./src/modules");
const localText = require('./src/text/text.json')
const {
   bot,
   createOneTimeLink
} = require('./src/lib/bot')
const model = require('./model');
const {
   CronJob
} = require('cron');
const {
   sendMessageBefore,
   paySubcribe,
   pay
} = require('./src/lib/cron/cron')
const atmos = require('./src/lib/atmos/atmos')

const publicFolderPath = path.join(__dirname, 'public');
const imagesFolderPath = path.join(publicFolderPath, 'images');

if (!fs.existsSync(publicFolderPath)) {
   fs.mkdirSync(publicFolderPath);
   console.log('Public folder created successfully.');
} else {
   console.log('Public folder already exists.');
}

if (!fs.existsSync(imagesFolderPath)) {
   fs.mkdirSync(imagesFolderPath);
   console.log('Images folder created successfully.');
} else {
   console.log('Images folder already exists within the public folder.');
}

bot.onText(/\/start/, async (msg) => {
   const chatId = msg.chat.id;
   const foundUser = await model.foundUser(chatId)
   const usersCard = await model.userCard(chatId)

   if (!foundUser) {
      bot.sendMessage(chatId, localText?.startText, {
         reply_markup: {
            inline_keyboard: [
               [{
                  text: localText?.offerLink,
                  web_app: {
                     url: `https://www.instagram.com/`
                  }
               }],
               [{
                  text: localText.agree,
                  callback_data: "agreement"
               }],
            ],
            resize_keyboard: true
         }
      }).then(async () => {
         await model.createUser(
            chatId,
            "start"
         )
      }).catch(e => console.log(e))
   } else if (usersCard?.length == 0 && foundUser) {
      bot.sendMessage(chatId, localText.sendContact, {
         reply_markup: {
            keyboard: [
               [{
                  text: localText.sendContact,
                  request_contact: true,
                  one_time_keyboard: true
               }]
            ],
            resize_keyboard: true
         }
      }).then(async () => {
         await model.editStep(chatId, 'register')
      }).catch(e => console.log(e))
   } else {
      bot.sendMessage(chatId, localText.mainScreen, {
         reply_markup: {
            keyboard: [

               foundUser?.duration == false ? (
                  [{
                     text: localText.activatingSubscriptionBtn
                  }]
               ) : [],
               [{
                  text: localText.myCardsBtn,
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
         await model.editStep(chatId, 'mainSrean');
      }).catch(e => console.log(e));
   }
})

bot.on('chat_join_request', async (msg) => {
   const chatId = msg.chat.id;
   const userId = msg.from.id;

   bot.sendMessage(userId, localText?.startText, {
      reply_markup: {
         inline_keyboard: [
            [{
               text: localText?.offerLink,
               web_app: {
                  url: `https://www.instagram.com/`
               }
            }],
            [{
               text: localText.agree,
               callback_data: "agreement",
               url: 'https://t.me/botbotobtobt_bot?start=join_group'
            }],
         ],
      }
   }).then(async () => {
      const foundUser = await model.foundUser(userId)

      if (!foundUser) {
         await model.createUser(
            userId,
            "start"
         )
      } else {
         await model.editStep(userId, 'start')
      }
   }).catch(e => console.log(e))
});

bot.on("callback_query", async (msg) => {
   const chatId = msg.message.chat.id;
   const data = msg.data;
   const foundUser = await model.foundUser(chatId)

   if (data === 'agreement') {
      bot.sendMessage(chatId, localText.sendContact, {
         reply_markup: {
            keyboard: [
               [{
                  text: localText.sendContact,
                  request_contact: true,
                  one_time_keyboard: true
               }]
            ],
            resize_keyboard: true
         }
      }).then(async () => {
         await model.editStep(chatId, 'register')
      }).catch(e => console.log(e))
   } else if (data.startsWith('card_')) {
      const cardId = data?.split('card_')[1]
      const card = await model.card(cardId)

      if (card) {
         bot.sendMessage(chatId, `${card?.card_number_hash}\n${card?.card_holder}`, {
            reply_markup: {
               inline_keyboard: [
                  [{

                     text: localText.makeMainCardBtn,
                     callback_data: `main_card_${cardId}`
                  }],
                  [{
                     text: localText.deleteCardBtn,
                     callback_data: `delete_card_${cardId}`
                  }],
                  [{
                     text: localText.backBtn,
                     callback_data: `cancel_delete_card`
                  }]
               ]
            }
         }).then(async () => {
            await model.editStep(chatId, 'infoCard')
         }).catch(e => console.log(e))
      }
   } else if (data.startsWith('main_card_')) {
      const cardId = data?.split('main_card_')[1]
      const card = await model.card(cardId)

      if (card) {
         const turnOffMain = await model.turnOffMain(chatId)
         const editMainCard = await model.editMainCard(cardId)

         if (turnOffMain && editMainCard) {
            bot.sendMessage(chatId, `${localText.mainCardText} ${card?.card_number_hash}`).then(async () => {
               await model.editStep(chatId, 'mainCard')
            }).catch(e => console.log(e))

            const userCard = await model.userCard(chatId)
            const cardsKeyboard = userCard.map(card => {
               return [{
                  text: card.card_number_hash,
                  callback_data: `card_${card?.id}`
               }];
            });
            cardsKeyboard.push([{
               text: localText.addCardBtn,
               web_app: {
                  url: `https://web-page-one-theta.vercel.app/${chatId}`
               }
            }])

            bot.sendMessage(chatId, localText?.myCardsText, {
               reply_markup: {
                  inline_keyboard: cardsKeyboard,
               }
            }).then(async () => {
               await model.editStep(chatId, 'myCards');
            })
         }
      }
   } else if (data.startsWith('delete_card_')) {
      const cardId = data?.split('delete_card_')[1]
      const card = await model.card(cardId)

      if (card) {
         bot.sendMessage(chatId, localText.deleteCardText, {
            reply_markup: {
               inline_keyboard: [
                  [{
                     text: localText.yesBtn,
                     callback_data: `agree_delete_${cardId}`
                  }],
                  [{
                     text: localText.cancellationBtn,
                     callback_data: `cancel_delete_card`
                  }],
               ]
            }
         }).then(async () => {
            await model.editStep(chatId, 'askingDeleteCard')
         }).catch(e => console.log(e))
      }
   } else if (data?.startsWith("agree_delete_")) {
      const cardId = data?.split('agree_delete_')[1]
      const card = await model.card(cardId)

      if (card) {
         const atmosToken = await model.atmosToken()
         const removeCardAtmos = await atmos.removeCard(
            card?.card_id,
            card?.card_token,
            atmosToken?.token,
            atmosToken?.expires
         )

         if (removeCardAtmos?.result?.code == "OK") {
            const deleteCard = await model.deleteCard(removeCardAtmos?.data?.card_id)

            if (deleteCard) {
               bot.sendMessage(chatId, localText.deletedCardText).then(async () => {
                  await model.editStep(chatId, 'deletedCard')
               })

               const userCard = await model.userCard(chatId)

               if (userCard?.length > 0) {
                  const cardsKeyboard = userCard.map(card => {
                     return [{
                        text: card.card_number_hash,
                        callback_data: `card_${card?.id}`
                     }];
                  });
                  cardsKeyboard.push([{
                     text: localText.addCardBtn,
                     web_app: {
                        url: `https://web-page-one-theta.vercel.app/${chatId}`
                     }
                  }])

                  bot.sendMessage(chatId, localText?.myCardsText, {
                     reply_markup: {
                        inline_keyboard: cardsKeyboard,
                     }
                  }).then(async () => {
                     await model.editStep(chatId, 'myCards');
                  })
               } else {
                  const editDuration = await model.editDuration(chatId, false)

                  if (editDuration) {
                     bot.sendMessage(chatId, localText.mainScreen, {
                        reply_markup: {
                           keyboard: [
                              editDuration?.duration == false ? (
                                 [{
                                    text: localText.activatingSubscriptionBtn,
                                    web_app: {
                                       url: `https://web-page-one-theta.vercel.app/${chatId}`
                                    }
                                 }]
                              ) : [],
                              [{
                                 text: localText.historyPayBtn,
                              }],
                              [{
                                 text: localText.contactAdmin,
                              }],
                           ],
                           resize_keyboard: true
                        }
                     })
                  }
               }


            }
         } else {
            bot.sendMessage(chatId, localText.deletedCardError).then(async () => {
               await model.editStep(chatId, 'deletedCard')
            })
         }
      }
   } else if (data == 'cancel_delete_card') {
      const userCard = await model.userCard(chatId)
      const cardsKeyboard = userCard.map(card => {
         return [{
            text: card.card_number_hash,
            callback_data: `card_${card?.id}`
         }];
      });
      cardsKeyboard.push([{
         text: localText.addCardBtn,
         web_app: {
            url: `https://web-page-one-theta.vercel.app/${chatId}`
         }
      }])

      bot.sendMessage(chatId, localText?.myCardsText, {
         reply_markup: {
            inline_keyboard: cardsKeyboard,
         }
      }).then(async () => {
         await model.editStep(chatId, 'myCards');
      })
   }
});

bot.on('contact', async (msg) => {
   const chatId = msg.chat.id;
   const foundUser = await model.foundUser(chatId)

   if (msg.contact && foundUser?.step == "register") {
      let phoneNumber = msg.contact.phone_number;

      if (msg.contact.user_id !== msg.from.id) {
         return bot.sendMessage(chatId, localText.contactRegisterError, {
            reply_markup: {
               keyboard: [
                  [{
                     text: buttonText,
                     request_contact: true
                  }]
               ],
               resize_keyboard: true,
               one_time_keyboard: true
            }
         })
      }

      if (!phoneNumber.startsWith('+')) {
         phoneNumber = `+${phoneNumber}`;
      }

      const addPhoneUser = await model.addPhoneUser(chatId, phoneNumber)

      if (addPhoneUser) {
         bot.sendMessage(chatId, localText.registeredSuccessText, {
            reply_markup: {
               keyboard: [
                  [{
                     text: localText.activationBtn,
                     web_app: {
                        url: `https://web-page-one-theta.vercel.app/${chatId}`
                     }
                  }],
                  [{
                     text: localText.contactAdmin,
                  }],
               ],
               resize_keyboard: true
            }
         }).then(async () => {
            await model.editStep(chatId, 'webpage');
         }).catch(e => console.log(e));
      }
   }
})

bot.on('message', async (msg) => {
   const chatId = msg.chat.id;
   const text = msg.text;
   const foundUser = await model.foundUser(Number(chatId))

   if (text == localText.contactAdmin) {
      bot.sendMessage(chatId, localText.contactAdminText, {
         reply_markup: {
            keyboard: [
               [{
                  text: localText.backBtn,
               }]
            ],
            resize_keyboard: true
         }
      }).then(async () => {
         await model.editStep(chatId, 'contactAdmin');
      }).catch(e => console.log(e));
   } else if (text == localText.backBtn) {
      if (foundUser?.step == "contactAdmin") {
         const userCard = await model.userCard(chatId)
         if (userCard?.length > 0) {
            bot.sendMessage(chatId, localText.startText, {
               reply_markup: {
                  keyboard: [
                     [{
                        text: localText.activationBtn,
                        web_app: {
                           url: `https://web-page-one-theta.vercel.app/${chatId}`
                        }
                     }],
                     [{
                        text: localText.contactAdmin,
                     }],
                  ],
                  resize_keyboard: true
               }
            }).then(async () => {
               await model.editStep(chatId, 'webpage');
            }).catch(e => console.log(e));
         } else {
            bot.sendMessage(chatId, localText.mainScreen, {
               reply_markup: {
                  keyboard: [

                     foundUser?.duration == false ? (
                        [{
                           text: localText.activatingSubscriptionBtn
                        }]
                     ) : [],
                     [{
                        text: localText.myCardsBtn,
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
               await model.editStep(chatId, 'mainSrean');
            }).catch(e => console.log(e));
         }
      } else if (
         foundUser?.step == 'myCards' ||
         foundUser?.step == 'historyPayment'
      ) {
         bot.sendMessage(chatId, localText.mainScreen, {
            reply_markup: {
               keyboard: [

                  foundUser?.duration == false ? (
                     [{
                        text: localText.activatingSubscriptionBtn
                     }]
                  ) : [],
                  [{
                     text: localText.myCardsBtn,
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
            await model.editStep(chatId, 'mainSrean');
         }).catch(e => console.log(e));
      } else if (
         foundUser?.step == "infoCard" ||
         foundUser?.step == "askingDeleteCard"
      ) {
         const userCard = await model.userCard(chatId)
         const cardsKeyboard = userCard.map(card => {
            return [{
               text: card.card_number_hash,
               callback_data: `card_${card?.id}`
            }];
         });
         cardsKeyboard.push([{
            text: localText.addCardBtn,
            web_app: {
               url: `https://web-page-one-theta.vercel.app/${chatId}`
            }
         }])

         bot.sendMessage(chatId, localText?.myCardsText, {
            reply_markup: {
               inline_keyboard: cardsKeyboard,
            }
         }).then(async () => {
            await model.editStep(chatId, 'myCards');
         })
      } else if (foundUser?.step == "paid") {
         const checksUser = await model.checksUser(chatId)

         if (checksUser?.length > 0) {
            const checks = checksUser.map((check, index) => `${index + 1}. ${check?.ofd_url}`).join("\n");

            bot.sendMessage(chatId, checks, {
               reply_markup: {
                  keyboard: [
                     [{
                        text: localText.getLinkBtn
                     }],
                     [{
                        text: foundUser?.duration ? localText.unsubscribeBtn : localText.activatingSubscriptionBtn
                     }],
                     [{
                        text: localText.backBtn
                     }]
                  ],
                  resize_keyboard: true
               }
            }), then(async () => {
               await model.editStep(chatId, 'historyPayment');
            })
         }
      } else if (foundUser?.step == "onSubcribe") {
         bot.sendMessage(chatId, localText.mainScreen, {
            reply_markup: {
               keyboard: [
                  [{
                     text: localText.activatingSubscriptionBtn,
                  }],
                  [{
                     text: localText.myCardsBtn,
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
            await model.editStep(chatId, 'mainSrean');
         }).catch(e => console.log(e));
      }
   } else if (text == localText.myCardsBtn) {
      const userCard = await model.userCard(chatId)
      const cardsKeyboard = userCard?.map(card => {
         return [{
            text: card?.card_number_hash,
            callback_data: `card_${card?.id}`
         }];
      });
      cardsKeyboard.push([{
         text: localText.addCardBtn,
         web_app: {
            url: `https://web-page-one-theta.vercel.app/${chatId}`
         }
      }])

      bot.sendMessage(chatId, localText?.myCardsText, {
         reply_markup: {
            inline_keyboard: cardsKeyboard,
         }
      }).then(async () => {
         await model.editStep(chatId, 'myCards');
      })
   } else if (text == localText.historyPayBtn) {
      const checksUser = await model.checksUser(chatId)

      if (checksUser?.length > 0) {
         const checks = checksUser.map((check, index) => `${index + 1}. ${check?.ofd_url}`).join("\n");

         bot.sendMessage(chatId, checks, {
            reply_markup: {
               keyboard: [
                  [{
                     text: localText.getLinkBtn
                  }],
                  [{
                     text: foundUser?.duration ? localText.unsubscribeBtn : localText.activatingSubscriptionBtn
                  }],
                  [{
                     text: localText.backBtn
                  }]
               ],
               resize_keyboard: true
            }
         }).then(async () => {
            await model.editStep(chatId, 'historyPayment');
         })
      } else {
         bot.sendMessage(chatId, localText.dataNotFoundText, {
            reply_markup: {
               keyboard: [
                  [{
                     text: localText.getLinkBtn
                  }],
                  [{
                     text: foundUser?.duration ? localText.unsubscribeBtn : localText.activatingSubscriptionBtn
                  }],
                  [{
                     text: localText.backBtn
                  }]
               ],
               resize_keyboard: true
            }
         }).then(async () => {
            await model.editStep(chatId, 'historyPayment');
         })
      }
   } else if (text == localText.getLinkBtn) {
      const currentDate = new Date();
      const current = Math.floor(currentDate.getTime() / 1000)

      if (foundUser?.expired > current) {
         const invateLink = await createOneTimeLink()
         bot.sendMessage(chatId, `${localText.getLinkText} ${invateLink}`).then(async () => {
            await model.editStep(chatId, "getLink")
         })
      } else {
         bot.sendMessage(chatId, localText.activatingSubscriptionText).then(async () => {
            await model.editStep(chatId, "getLink")
         })
      }
   } else if (text == localText.unsubscribeBtn) {
      const editDuration = await model.editDuration(chatId, false)

      if (editDuration) {
         bot.sendMessage(chatId, localText.unsubscribeText, {
            reply_markup: {
               keyboard: [
                  [{
                     text: localText.activatingSubscriptionBtn
                  }],
                  [{
                     text: localText.myCardsBtn,
                  }],
                  [{
                     text: localText.historyPayBtn,
                  }],
                  [{
                     text: localText.contactAdmin,
                  }]
               ],
               resize_keyboard: true
            }
         }).then(async () => {
            await model.editStep(chatId, "offDuration")
         })
      }
   } else if (text == localText.activatingSubscriptionBtn) {
      const getUserCards = await model.userCard(chatId)
      const currentDate = new Date();
      const current = Math.floor(currentDate.getTime() / 1000)

      if (current >= foundUser?.expired && getUserCards?.length > 0) {
         let success = false;

         bot.sendMessage(chatId, localText.waitText).then(async () => {
            await model.editStep(chatId, "onDuration")
         })

         if (getUserCards?.length > 0) {

            for (const card of getUserCards) {
               if (success) break;

               const payed = await pay(foundUser, card);

               if (payed === 'Success') {
                  console.log(`Payment successful for user ${user.chat_id} with card ${card}`);
                  success = true;
                  await model.editDuration(chatId, true)
               }
            }
         } else {
            bot.sendMessage(chatId, localText.addCardActivatingSubscriptionText, {
               reply_markup: {
                  keyboard: [
                     [{
                        text: localText.addCardBtn,
                        web_app: {
                           url: `https://web-page-one-theta.vercel.app/${chatId}`
                        }
                     }],
                     [{
                        text: localText.backBtn
                     }]
                  ],
                  resize_keyboard: true
               }
            }).then(async () => {
               await model.editStep(chatId, "onSubcribe")
            })
         }

         if (success) {
            if (foundUser?.subscribe) {
               bot.sendMessage(chatId, localText.activatingSubscriptionText2).then(async () => {
                  await model.editStep(chatId, "paid")
                  await model.editDuration(chatId, true)
               })
            } else {
               const invateLink = await createOneTimeLink()

               if (invateLink) {
                  bot.sendMessage(chatId, `${localText.getLinkText} ${invateLink}`, {
                     reply_markup: {
                        keyboard: [
                           [{
                              text: localText.myCardsBtn,
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
                     await model.editStepSubcribe(chatId, "mainSrean", true)
                  })
               }
            }
         } else {
            bot.sendMessage(chatId, localText.deletedCardError).then(async () => {
               await model.editStep(chatId, "paid")
            })
         }
      } else {
         bot.sendMessage(chatId, localText.addCardActivatingSubscriptionText, {
            reply_markup: {
               keyboard: [
                  [{
                     text: localText.addCardBtn,
                     web_app: {
                        url: `https://web-page-one-theta.vercel.app/${chatId}`
                     }
                  }],
                  [{
                     text: localText.backBtn
                  }]
               ],
               resize_keyboard: true
            }
         }).then(async () => {
            await model.editStep(chatId, "onSubcribe")
         })
      }
   }
})

app.use(cors({
   origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({
   extended: true
}));
app.use('/public', express.static(path.resolve(__dirname, 'public')))
app.use("/api/v1", router);

// Job that runs every 2 minutes
const job = new CronJob('*/10 * * * *', async () => {
   await sendMessageBefore()
   await paySubcribe()
   console.log('aa')
});

// Start the job
job.start();

app.listen(4000, console.log(4000))