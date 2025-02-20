const {
   fetch,
   fetchALL
} = require('../postgres')

const atmosToken = () => {
   const QUERY = `
      SELECT
         *
      FROM
         atmos_token
   `;

   return fetch(QUERY)
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
const editUserExpired = (chat_id, expirationTimestamp) => {
   const QUERY = `
      UPDATE
         users
      SET
         expired = $2
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chat_id, expirationTimestamp)
}
const getUsersBefore2day = () => {
   const QUERY = `
      SELECT 
         *
      FROM 
         users
      WHERE 
         expired::date = (CURRENT_DATE + INTERVAL '2 day') 
         AND duration = true 
         AND subscribe = true;
   `;

   return fetchALL(QUERY)
}
const getUsersBefore1day = () => {
   const QUERY = `
      SELECT 
         *
      FROM 
         users
      WHERE 
         expired::date = (CURRENT_DATE + INTERVAL '1 day')
         AND duration = true 
         AND subscribe = true;
   `;

   return fetchALL(QUERY)
}
const getUsers = () => {
   const QUERY = `
      SELECT 
         *
      FROM 
         users
      WHERE 
         duration = true AND subscribe = true;  
   `;

   // const QUERY = `
   //    SELECT
   //       *
   //    FROM
   //       users
   //    WHERE
   //       expired::date = CURRENT_DATE
   //       AND duration = true
   //       AND subscribe = true;
   // `;

   return fetchALL(QUERY)
}
const getUsersAfter2days = () => {
   const QUERY = `
      SELECT 
         *
      FROM 
         users
      WHERE 
         expired::date = (CURRENT_DATE - INTERVAL '2 days')
         AND duration = true 
         AND subscribe = true;
   `;

   return fetchALL(QUERY)
}
const getUsersAfter1days = () => {
   const QUERY = `
      SELECT 
         *
      FROM 
         users
      WHERE 
         expired::date = (CURRENT_DATE - INTERVAL '1 days')
         AND duration = true 
         AND subscribe = true;
   `;

   return fetchALL(QUERY)
}
const getUserWithoutDuration = () => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      WHERE
         expired::date = CURRENT_DATE
         AND duration = true
         AND subscribe = true;  
   `;

   return fetchALL(QUERY)
}
const userCards = (chat_id) => {
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

   return fetchALL(QUERY, chat_id)
}

const editUserSubcribe = (chat_id, subscribe) => {
   const QUERY = `
      UPDATE
         users
      SET
         subscribe = $2
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, chat_id, subscribe)
}

module.exports = {
   atmosToken,
   price,
   addCheck,
   editUserExpired,
   getUsersBefore2day,
   getUsersBefore1day,
   getUsers,
   getUsersAfter2days,
   getUsersAfter1days,
   getUserWithoutDuration,
   userCards,
   editUserSubcribe
}