const {
   fetchALL,
   fetch
} = require('../../lib/postgres')

const price = () => {
   const QUERY = `
      SELECT
         *
      FROM
         prices
   `;

   return fetchALL(QUERY)
}
const addPrice = (name, price) => {
   const QUERY = `
      INSERT INTO 
         prices (
            name,
            price
         ) VALUES (
            $1, 
            $2 
         ) RETURNING *;
   `;

   return fetch(QUERY, name, price)
}
const editPrice = (id, price) => {
   const QUERY = `
      UPDATE
         prices
      SET
         price
      WHERE
         id = $1
      RETURNING *;
   `;

   return fetch(QUERY, id, price)
}

module.exports = {
   price,
   addPrice,
   editPrice
}