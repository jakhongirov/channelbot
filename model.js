const { fetch, fetchALL } = require('./src/lib/postgres')

const foundUser = (chatId) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      WHERE
         chat_id = $1;
   `;

   return fetch(QUERY, chatId)
}
const createUser = (
   chatId,
   step
) => {
   const QUERY = `
      INSERT INTO
         users (
            chat_id,
            step
         ) VALUES (
            $1, 
            $2 
         ) RETURNING *;
   `;

   return fetch(QUERY, chatId, step)
}
const editStep = (chatId, step) => {
   const QUERY = `
      UPDATE
         users
      SET
         step = $2
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, step)
}
const editStepSubcribe = (chatId, step, subscribe) => {
   const QUERY = `
      UPDATE
         users
      SET
         step = $2,
         subscribe = $3
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, step, subscribe)
}
const addPhoneUser = (chatId, phoneNumber) => {
   const QUERY = `
      UPDATE
         users
      SET
         phone_number = $2
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, phoneNumber)
}
const card = (cardId) => {
   const QUERY = `
      SELECT
         *
      FROM
         cards
      WHERE
         id = $1;
   `;

   return fetch(QUERY, cardId)
}
const turnOffMain = (chatId) => {
   const QUERY = `
      UPDATE
         cards
      SET
         main = false
      WHERE
         user_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId)
}
const editMainCard = (cardId) => {
   const QUERY = `
      UPDATE
         cards
      SET
         main = true
      WHERE
         id = $1
      RETURNIG *;
   `;

   return fetch(QUERY, cardId)
}
const userCard = (chatId) => {
   const QUERY = `
      SELECT
         *
      FROM
         cards
      WHERE
         user_id = $1
      ORDER BY
         main;
   `;

   return fetchALL(QUERY, chatId)
}
const atmosToken = () => {
   const QUERY = `
      SELECT
         *
      FROM
         atmos_token
   `;

   return fetch(QUERY)
}
const deleteCard = (card_id) => {
   const QUERY = `
      DELETE FROM
         cards
      WHERE
         card_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, card_id)
}
const editDuration = (chatId, duration) => {
   const QUERY = `
      UPDATE
         users
      SET
         duration = $2
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, duration)
}
const checksUser = (chatId) => {
   const QUERY = `
      SELECT
         *
      FROM
         checks
      WHERE
         user_id = $1
      ORDER BY
         create_at;
   `;

   return fetchALL(QUERY, chatId)
}

module.exports = {
   foundUser,
   createUser,
   editStep,
   addPhoneUser,
   editStepSubcribe,
   card,
   turnOffMain,
   editMainCard,
   userCard,
   atmosToken,
   deleteCard,
   editDuration,
   checksUser
}