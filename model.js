const {
   fetch,
   fetchALL
} = require('./src/lib/postgres')

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
const foundTrial = (param) => {
   const QUERY = `
      SELECT
         *
      FROM
         trial
      WHERE
         source = $1;
   `;

   return fetch(QUERY, param)
}
const price = () => {
   const QUERY = `
      SELECT
         *
      FROM
         prices;
   `;

   return fetch(QUERY)
}
const addTrial = (param) => {
   const QUERY = `
      INSERT INTO
         trial (
            source,
            day
         ) VALUES (
            $1,
            0
         ) RETURNING *;
   `;

   return fetch(QUERY, param)
}
const createUser = (
   chatId,
   step,
   source
) => {
   const QUERY = `
      INSERT INTO
         users (
            chat_id,
            step,
            source
         ) VALUES (
            $1, 
            $2,
            $3
         ) RETURNING *;
   `;

   return fetch(QUERY, chatId, step, source)
}
const createUserWithExpired = (
   chatId,
   step,
   source,
   expired
) => {
   const QUERY = `
      INSERT INTO
         users (
            chat_id,
            step,
            source,
            expired
         ) VALUES (
            $1, 
            $2,
            $3,
            $4
         ) RETURNING *;
   `;

   return fetch(QUERY, chatId, step, source, expired)
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
const editSubcribe = (chatId, subscribe) => {
   const QUERY = `
      UPDATE
         users
      SET
         subscribe = $2
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, subscribe)
}
const addPhoneUser = (chatId, phoneNumber, name) => {
   const QUERY = `
      UPDATE
         users
      SET
         phone_number = $2,
         name = $3
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chatId, phoneNumber, name)
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
         *,
         to_char(create_at, 'YYYY-MM-DD HH24:MI') AS formatted_time
      FROM
         checks
      WHERE
         user_id = $1
      ORDER BY
         create_at;
   `;

   return fetchALL(QUERY, chatId)
}
const adminUsername = () => {
   const QUERY = `
      SELECT
         *
      FROM
         channel_admin;
   `;

   return fetch(QUERY)
}

module.exports = {
   foundUser,
   foundTrial,
   price,
   addTrial,
   createUser,
   createUserWithExpired,
   editStep,
   addPhoneUser,
   editStepSubcribe,
   editSubcribe,
   card,
   turnOffMain,
   editMainCard,
   userCard,
   atmosToken,
   deleteCard,
   editDuration,
   checksUser,
   adminUsername
}