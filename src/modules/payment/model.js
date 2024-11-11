const {
   fetch,
   fetchALL
} = require('../../lib/postgres')

const checkUser = (chat_id) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      WHERE
         chat_id = $1;
   `;

   return fetch(QUERY, chat_id)
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
const checkUserCards = (chat_id) => {
   const QUERY = `
      SELECT
         *
      FROM
         cards
      WHERE
         user_id = $1;
   `;

   return fetchALL(QUERY, chat_id)
}
const foundCard = (card_id, chat_id) => {
   const QUERY = `
      SELECT
         *
      FROM
         cards
      WHERE
         user_id = $2 and card_id = $1;
   `;

   return fetch(QUERY, card_id, chat_id)
}
const addCard = (
   pan,
   expiry,
   card_holder,
   phone,
   card_token,
   code,
   transaction_id,
   chat_id,
   main,
   card_id
) => {
   const QUERY = `
      INSERT INTO
         cards (
            card_number_hash,
            expiry,
            card_holder,
            phone_number,
            card_token,
            otp,
            transaction_id,
            user_id,
            main,
            card_id
         ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      pan,
      expiry,
      card_holder,
      phone,
      card_token,
      code,
      transaction_id,
      chat_id,
      main,
      card_id
   )
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
const editUserExpired = (chat_id, expirationTimestamp, duration) => {
   const QUERY = `
      UPDATE
         users
      SET
         expired = $2,
         duration = $3
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chat_id, expirationTimestamp, duration)
}
const addCheck = (
   chat_id,
   success_trans_id,
   method,
   amount,
   transaction_id,
   ofd_url
) => {
   const QUERY = `
      INSERT INTO 
         checks (
            user_id,
            success_trans_id,
            method,
            amount,
            transaction_id,
            ofd_url
         ) VALUES (
            $1, 
            $2, 
            $3, 
            $4, 
            $5, 
            $6 
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      chat_id,
      success_trans_id,
      method,
      amount,
      transaction_id,
      ofd_url
   )
}
const editStep = (chat_id, step, subscribe) => {
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

   return fetch(QUERY, chat_id, step, subscribe)
}
const foundCardByCard_id = (card_id) => {
   const QUERY = `
      SELECT
         *
      FROM
         cards
      WHERE
        card_id = $1;
   `;

   return fetch(QUERY, card_id)
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
const editStepTrial = (chat_id, step, subscribe, expired) => {
   const QUERY = `
      UPDATE
         users
      SET
         step = $2,
         subscribe = $3,
         expired = $4
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chat_id, step, subscribe, expired)
}

module.exports = {
   checkUser,
   atmosToken,
   checkUserCards,
   addCard,
   foundCard,
   price,
   editUserExpired,
   addCheck,
   editStep,
   foundCardByCard_id,
   deleteCard,
   foundTrial,
   editStepTrial
}