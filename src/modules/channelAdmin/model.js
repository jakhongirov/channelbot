const {
   fetch
} = require('../../lib/postgres')

const channelAdmin = () => {
   const QUERY = `
      SELECT
         *
      FROM
         channel_admin
   `;

   return fetch(QUERY)
}
const addAdmin = (title, username) => {
   const QUERY = `
      INSERT INTO
         channel_admin (
            title,
            username
         ) VALUES (
            $1, 
            $2 
         ) RETURNING *;
   `;

   return fetch(QUERY, title, username)
}
const editAdmin = (id, username) => {
   const QUERY = `
      UPDATE
         channel_admin
      SET
         username = $2
      WHERE
         id = $1
      RETURNING *;
   `;

   return fetch(QUERY, id, username)
}

module.exports = {
   channelAdmin,
   addAdmin,
   editAdmin
}