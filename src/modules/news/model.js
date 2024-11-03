const {
   fetchALL
} = require('../../lib/postgres')

const users = (user_subcribe) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      ${
         user_subcribe == 'all' ? '' : (
            `
               WHERE
                  subscribe = ${user_subcribe}
            `
         ) 
      };
   `;

   return fetchALL(QUERY)
}

module.exports = {
   users
}