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
   createOneTimeLink,
   removeUserFromChannel
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

function formatBalanceWithSpaces(balance) {
   return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
   }).format(balance / 100).replace(/,/g, ' ');
}

bot.onText(/\/start ?(.*)?/, async (msg, match) => {
   const chatId = msg.chat.id;
   const param = match[1]?.trim();
   const foundUser = await model.foundUser(chatId)
   const usersCard = await model.userCard(chatId)

   if (foundUser?.step == 'webpage' && foundUser?.phone_number && foundUser?.expired == null) {
      if (param) {
         const foundTrial = await model.foundTrial(param)

         if (foundTrial) {
            if (foundTrial?.day > 0) {
               const format = localText?.startTextFromTrial.replace(/%day%/g, foundTrial?.day)

               bot.sendMessage(chatId, format, {
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
                  await model.editStepTrial(
                     chatId,
                     'start',
                     param ? param : "organic",
                     2
                  )
               }).catch(e => console.log(e))
            } else {
               const price = await model.price()
               const format = localText.registeredSuccessText.replace(/%price%/g, formatBalanceWithSpaces(price?.price))
               bot.sendMessage(chatId, format, {
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
         } else {
            await model.addTrial(param)
            const price = await model.price()
            const format = localText.registeredSuccessText.replace(/%price%/g, formatBalanceWithSpaces(price?.price))
            bot.sendMessage(chatId, format, {
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

      } else {
         const price = await model.price()
         const format = localText.registeredSuccessText.replace(/%price%/g, formatBalanceWithSpaces(price?.price))
         bot.sendMessage(chatId, format, {
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
   } else if (!foundUser || foundUser?.expired == null) {
      if (param) {
         const foundTrial = await model.foundTrial(param)

         if (foundTrial) {
            const format = localText?.startTextFromTrial.replace(/%day%/g, foundTrial?.day)

            bot.sendMessage(chatId, format, {
               reply_markup: {
                  keyboard: [
                     [{
                        text: localText?.ofertaLink,
                        web_app: {
                           url: `https://atmos.uz/documents/`
                        }
                     }],
                     [{
                        text: localText.agree
                     }],
                  ],
                  resize_keyboard: true
               }
            }).then(async () => {
               if (!foundUser) {
                  await model.createUserWithTrial(
                     chatId,
                     "start",
                     param ? param : "organic",
                     2
                  )
               } else {
                  await model.editStep(chatId, 'start');
               }
            }).catch(e => console.log(e))
         } else {
            await model.addTrial(param)

            bot.sendMessage(chatId, localText?.startTextFromBot, {
               reply_markup: {
                  keyboard: [
                     [{
                        text: localText?.ofertaLink,
                        web_app: {
                           url: `https://atmos.uz/documents/`
                        }
                     }],
                     [{
                        text: localText.agree
                     }],
                  ],
                  resize_keyboard: true
               }
            }).then(async () => {
               if (!foundUser) {
                  await model.createUser(
                     chatId,
                     "start",
                     param ? param : "organic"
                  )
               } else {
                  await model.editStep(chatId, 'start');
               }
            }).catch(e => console.log(e))
         }
      } else {
         bot.sendMessage(chatId, localText?.startTextFromBot, {
            reply_markup: {
               keyboard: [
                  [{
                     text: localText?.ofertaLink,
                     web_app: {
                        url: `https://atmos.uz/documents/`
                     }
                  }],
                  [{
                     text: localText.agree
                  }],
               ],
               resize_keyboard: true
            }
         }).then(async () => {
            if (!foundUser) {
               await model.createUser(
                  chatId,
                  "start",
                  param ? param : "organic"
               )
            } else {
               await model.editStep(chatId, 'start');
            }
         }).catch(e => console.log(e))
      }
   } else {
      bot.sendMessage(chatId, localText.mainScreen, {
         reply_markup: {
            keyboard: [
               ...(foundUser?.duration === false ? [
                  [{
                     text: localText.activatingSubscriptionBtn
                  }]
               ] : []),
               [{
                  text: localText.myCardsBtn
               }],
               [{
                  text: localText.historyPayBtn
               }],
               [{
                  text: localText.contactAdmin
               }]
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
   const foundUser = await model.foundUser(userId)
   const current = new Date().toISOString().split('T')[0];

   if (!foundUser) {
      bot.sendMessage(userId, localText?.startTextFromChannel, {
         reply_markup: {
            keyboard: [
               [{
                  text: localText?.ofertaLink,
                  web_app: {
                     url: `https://atmos.uz/documents/`
                  }
               }],
               [{
                  text: localText.agree
               }],
            ],
            resize_keyboard: true
         }
      }).then(async () => {
         const foundUser = await model.foundUser(userId)

         if (!foundUser) {
            await model.createUser(
               chatId,
               "start",
               "channel_link"
            )
         } else {
            await model.editStep(userId, 'start')
         }
      }).catch(e => console.log(e))
   } else if (foundUser?.expired > current) {
      try {
         await await bot.approveChatJoinRequest(chatId, userId).then(async () => {
            await model.editSubcribe(userId, true)
         });
      } catch (error) {
         console.error('Error approving join request:', error);
      }
   }
});

bot.on("callback_query", async (msg) => {
   const chatId = msg.message.chat.id;
   const data = msg.data;
   const foundUser = await model.foundUser(chatId)

   if (data == 'know') {
      if (foundUser?.trial == 2) {
         const foundTrial = await model.foundTrial(foundUser?.source)

         if (foundTrial?.day > 0) {
            const format = localText?.startTextFromTrial.replace(/%day%/g, foundTrial?.day)

            bot.sendMessage(chatId, format, {
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
               await model.editStep(chatId, 'trial');
            }).catch(e => console.log(e))
         } else {
            const price = await model.price()
            const format = localText.registeredSuccessText.replace(/%price%/g, formatBalanceWithSpaces(price?.price))
            bot.sendMessage(chatId, format, {
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
      } else {
         const price = await model.price()
         const format = localText.registeredSuccessText.replace(/%price%/g, formatBalanceWithSpaces(price?.price))
         bot.sendMessage(chatId, format, {
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

   } else if (data == "no_know") {
      bot.sendMessage(chatId, localText.aboutFullContact)

      if (foundUser?.trial == 2) {
         const foundTrial = await model.foundTrial(foundUser?.source)

         if (foundTrial?.day > 0) {
            const format = localText?.startTextFromTrial.replace(/%day%/g, foundTrial?.day)

            bot.sendMessage(chatId, format, {
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
               await model.editStep(chatId, 'trial');
            }).catch(e => console.log(e))
         } else {
            const price = await model.price()
            const format = localText.registeredSuccessText.replace(/%price%/g, formatBalanceWithSpaces(price?.price))
            bot.sendMessage(chatId, format, {
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
      } else {
         const price = await model.price()
         const format = localText.registeredSuccessText.replace(/%price%/g, formatBalanceWithSpaces(price?.price))
         bot.sendMessage(chatId, format, {
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

   } else if (data.startsWith('card_')) {
      const cardId = data?.split('card_')[1]
      const card = await model.card(cardId)

      if (card) {
         const userCard = await model.userCard(chatId)
         bot.sendMessage(chatId, `${card?.card_number_hash}\n${card?.card_holder}`, {
            reply_markup: {
               inline_keyboard: [
                  ...(userCard?.length > 1 ? [
                     [{
                        text: localText.makeMainCardBtn,
                        callback_data: `main_card_${cardId}`
                     }]
                  ] : []),
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
                              ...(editDuration?.duration === false ? [{
                                 text: localText.activatingSubscriptionBtn,
                                 web_app: {
                                    url: `https://web-page-one-theta.vercel.app/${chatId}`
                                 }
                              }] : []),
                              [{
                                 text: localText.myCardsBtn
                              }],
                              [{
                                 text: localText.historyPayBtn
                              }],
                              [{
                                 text: localText.contactAdmin
                              }]
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
      let name = msg.contact.first_name;

      if (msg.contact.user_id !== msg.from.id) {
         return bot.sendMessage(chatId, localText.contactRegisterError, {
            reply_markup: {
               keyboard: [
                  [{
                     text: sendContactBtn,
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

      const addPhoneUser = await model.addPhoneUser(chatId, phoneNumber, name)

      if (addPhoneUser) {

         bot.sendMessage(chatId, `${localText.askFullContact}`, {
            reply_markup: {
               inline_keyboard: [
                  [{
                     text: localText.askFullContactYesBtn,
                     callback_data: 'know'
                  }],
                  [{
                     text: localText.askFullContactNoBtn,
                     callback_data: 'no_know'
                  }],
               ]
            }
         })

         // if (addPhoneUser?.expired > current) {
         //    const invateLink = await createOneTimeLink()
         //    bot.sendMessage(chatId, `${localText.getLinkText} ${invateLink}`, {
         //       reply_markup: {
         //          keyboard: [
         //             ...(addPhoneUser?.duration === false ? [
         //                [{
         //                   text: localText.activatingSubscriptionBtn
         //                }]
         //             ] : []),
         //             [{
         //                text: localText.myCardsBtn
         //             }],
         //             [{
         //                text: localText.historyPayBtn
         //             }],
         //             [{
         //                text: localText.contactAdmin
         //             }]
         //          ],
         //          resize_keyboard: true
         //       }
         //    }).then(async () => {
         //       await model.editStep(chatId, "getLink")
         //    })
         // } else {
         //    const price = await model.price()
         //    const format = localText.registeredSuccessText.replace(/%price%/g, formatBalanceWithSpaces(price?.price))
         //    bot.sendMessage(chatId, format, {
         //       reply_markup: {
         //          keyboard: [
         //             [{
         //                text: localText.activationBtn,
         //                web_app: {
         //                   url: `https://web-page-one-theta.vercel.app/${chatId}`
         //                }
         //             }],
         //             [{
         //                text: localText.contactAdmin,
         //             }],
         //          ],
         //          resize_keyboard: true
         //       }
         //    }).then(async () => {
         //       await model.editStep(chatId, 'webpage');
         //    }).catch(e => console.log(e));
         // }
      }
   }
})

bot.on('message', async (msg) => {
   const chatId = msg.chat.id;
   const text = msg.text;
   const foundUser = await model.foundUser(Number(chatId))

   if (text == localText.agree) {
      bot.sendMessage(chatId, localText.sendContact, {
         reply_markup: {
            keyboard: [
               [{
                  text: localText.sendContactBtn,
                  request_contact: true,
                  one_time_keyboard: true
               }]
            ],
            resize_keyboard: true
         }
      }).then(async () => {
         await model.editStep(chatId, 'register')
      }).catch(e => console.log(e))
   } else if (text == localText.contactAdmin) {
      const adminUsername = await model.adminUsername()
      const formattedText = adminUsername?.username
         .replace(/<p>/g, '')
         .replace(/<\/p>/g, '\n')
         .replace(/<br\s*\/?>/g, '\n')
         .replace(/&nbsp;/g, ' ');
      bot.sendMessage(chatId, formattedText, {
         reply_markup: {
            keyboard: [
               [{
                  text: localText.backBtn,
               }]
            ],
            resize_keyboard: true
         },
         parse_mode: "HTML"
      }).then(async () => {
         await model.editStep(chatId, 'contactAdmin');
      }).catch(e => console.log(e));
   } else if (text == localText.backBtn) {
      if (foundUser?.step == "contactAdmin") {
         const userCard = await model.userCard(chatId)
         if (userCard?.length == 0 && foundUser?.expired == null) {
            bot.sendMessage(chatId, localText.startTextFromBot, {
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
                     ...(foundUser?.duration === false ? [
                        [{
                           text: localText.activatingSubscriptionBtn
                        }]
                     ] : []),
                     [{
                        text: localText.myCardsBtn
                     }],
                     [{
                        text: localText.historyPayBtn
                     }],
                     [{
                        text: localText.contactAdmin
                     }]
                  ],
                  resize_keyboard: true
               }
            }).then(async () => {
               await model.editStep(chatId, 'mainSrean');
            }).catch(e => console.log(e));
         }
      } else if (
         foundUser?.step == 'myCards' ||
         foundUser?.step == 'historyPayment' ||
         foundUser?.step == "getLink"
      ) {
         bot.sendMessage(chatId, localText.mainScreen, {
            reply_markup: {
               keyboard: [
                  ...(foundUser?.duration === false ? [
                     [{
                        text: localText.activatingSubscriptionBtn
                     }]
                  ] : []),
                  [{
                     text: localText.myCardsBtn
                  }],
                  [{
                     text: localText.historyPayBtn
                  }],
                  [{
                     text: localText.contactAdmin
                  }]
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
            const checks = checksUser.map(
               (check, index) =>
               `${index + 1}. Sana: ${check?.formatted_time}\nSumma: ${formatBalanceWithSpaces(check?.amount)} sum\n${check?.ofd_url}`
            ).join("\n\n");

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
                  ...(foundUser?.duration === false ? [
                     [{
                        text: localText.activatingSubscriptionBtn
                     }]
                  ] : []),
                  [{
                     text: localText.myCardsBtn
                  }],
                  [{
                     text: localText.historyPayBtn
                  }],
                  [{
                     text: localText.contactAdmin
                  }]
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
         const checks = checksUser.map(
            (check, index) =>
            `${index + 1}. Sana: ${check?.formatted_time}\nSumma: ${formatBalanceWithSpaces(check?.amount)} sum\n${check?.ofd_url}`
         ).join("\n\n");

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
      const current = new Date().toISOString().split('T')[0];

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
      const current = new Date().toISOString().split('T')[0];

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
               bot.sendMessage(chatId, localText.activatingSubscriptionText2, {
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
                  await model.editStep(chatId, "historyPayment")
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
                     await model.editStepSubcribe(chatId, "mainSrean", false)
                  })
               }
            }
         } else {
            bot.sendMessage(chatId, localText.deletedCardError).then(async () => {
               await model.editStep(chatId, "historyPayment")
            })
         }
      } else if (current < foundUser?.expired) {
         bot.sendMessage(chatId, localText.activatingSubscriptionText2, {
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
            await model.editStep(chatId, "paid")
            await model.editDuration(chatId, true)
         })
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
const job = new CronJob('0 1 * * *', async () => {
   await sendMessageBefore();
   await paySubcribe();
   console.log('aa');
});

// Start the job
job.start();

app.listen(4000, console.log(4000))