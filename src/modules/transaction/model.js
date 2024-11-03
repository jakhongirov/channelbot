const {
   fetchALL,
   fetch
} = require('../../lib/postgres')

const transaction = (limit, page) => {
   const QUERY = `
      SELECT
         *
      FROM
         checks
      ORDER BY
         id DESC
      LIMIT ${limit}
      OFFSET ${Number((page - 1) * limit)};
   `;

   return fetchALL(QUERY)
}
const transactionsFilter = (limit, page, month, year) => {
   const QUERY = `
      SELECT
         *
      FROM
         checks
      WHERE
         EXTRACT(MONTH FROM create_at) = $1 
         AND EXTRACT(YEAR FROM create_at) = $2
      ORDER BY
         id DESC
      LIMIT $3
      OFFSET $4;
   `;
   return fetchALL(QUERY, month, year, limit, (page - 1) * limit);
}
const transactionsAmount = (month, year) => {
   const QUERY = `
      SELECT
         sum(amount)
      FROM
         checks
      WHERE
         EXTRACT(MONTH FROM create_at) = $1 
         AND EXTRACT(YEAR FROM create_at) = $2;
   `;

   return fetch(QUERY, month, year)
}
const transactionsUserId = (user_id) => {
   const QUERY = `
      SELECT
         *
      FROM
         checks
      WHERE 
         user_id = $1
      ORDER BY
         id DESC;
   `;

   return fetchALL(QUERY, user_id)
}
const foundUser = (user_id) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      WHERE
         chat_id = $1
   `;

   return fetch(QUERY, user_id)
}
const addTransaction = (
   user_id,
   method,
   amount
) => {
   const QUERY = `
      INSERT INTO
         checks (
            user_id,
            method,
            amount
         ) VALUES (
            $1, 
            $2, 
            $3 
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      user_id,
      method,
      amount
   )
}
const expiredDate = (user_id, expiredDate) => {
   const QUERY = `
      UPDATE
         users
      SET
         expired = $2
      WHERE
         chat_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, user_id, expiredDate)
}

module.exports = {
   transaction,
   transactionsFilter,
   transactionsAmount,
   transactionsUserId,
   foundUser,
   addTransaction,
   expiredDate
}