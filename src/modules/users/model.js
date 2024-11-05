const {
   fetchALL,
   fetch
} = require('../../lib/postgres')

const users = (limit, page, phone) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      ${
         phone ? (
            `
               WHERE
                  phone_number ilike '%${phone}%'
            `
         ): ""
      }
      ORDER BY
         id DESC
      LIMIT ${limit}
      OFFSET ${Number((page - 1) * limit)};
   `;

   return fetchALL(QUERY)
}
const foundUser = (chat_id) => {
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
const allUser = () => {
   const QUERY = `
      SELECT
         count(chat_id)
      FROM
         users;
   `;

   return fetch(QUERY)
}
const payedUsers = () => {
   const QUERY = `
      SELECT 
         COUNT(DISTINCT user_id)
      FROM
         checks;
   `;

   return fetch(QUERY)
}

module.exports = {
   users,
   foundUser,
   allUser,
   payedUsers
}