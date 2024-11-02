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
const transactionsFilter = (
   limit,
   page,
   month,
   year
) => {
   const QUERY = `
      SELECT
         *
      FROM
         checks
      WHERE
         EXTRACT(YEAR FROM create_at) = $2
         and EXTRACT(MONTH FROM create_at) = $1
      ORDER BY
         id DESC
      LIMIT ${limit}
      OFFSET ${Number((page - 1) * limit)};`;

   return fetchALL(QUERY, month, year)
}
const transactionsAmount = (month, year) => {
   const QUERY = `
      SELECT
         sum(amount)
      FROM
         checks
      WHERE
         EXTRACT(YEAR FROM create_at) = 2024
         and EXTRACT(MONTH FROM create_at) = 10;`;

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

module.exports = {
   transaction,
   transactionsFilter,
   transactionsAmount,
   transactionsUserId,
   addTransaction
}