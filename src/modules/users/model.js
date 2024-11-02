const {
   fetchALL
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

module.exports = {
   users
}