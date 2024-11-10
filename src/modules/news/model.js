const {
   fetchALL,
   fetch
} = require('../../lib/postgres')

const news = (page, limit) => {
   const QUERY = `
      SELECT
         *
      FROM
         news
      ORDER BY
         id DESC
      LIMIT ${limit}
      OFFSET ${Number((page - 1) * limit)}
   `;

   return fetchALL(QUERY)
}
const userList = (user_id) => {
   const id = user_id?.length > 0 ? user_id?.join(', ') : user_id
   const QUERY = `
      SELECT
         *
      FROM
         users
      WHERE
         chat_id IN ($1);
   `;

   return fetch(QUERY, id)
}
const users = (user_subcribe, source) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      ${
         user_subcribe != 'all' && source != 'all' ? (
            `
               WHERE
                  subscribe = ${user_subcribe}
                  AND source = '${source}'
            `
         ) : user_subcribe != 'all' && source == 'all' ? (
            `
               WHERE
                  subscribe = ${user_subcribe}
            `
         ): user_subcribe == 'all' && source != 'all' ? (
            `
               WHERE
                  source = '${source}'
            `
         ) : ''
      };
   `;

   return fetchALL(QUERY)
}
const addNewAllUser = (
   text,
   fileUrl,
   fileName,
   source,
   user_subcribe,
   user_count,
   user_id
) => {
   const QUERY = `
      INSERT INTO
         news (
            data,
            image_url,
            image_name,
            source,
            subscribe,
            user_count,
            user_id
         ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      text,
      fileUrl,
      fileName,
      source,
      user_subcribe,
      user_count,
      user_id
   )
}
const addNewUser = (
   text,
   fileUrl,
   fileName,
   chat_id
) => {
   const QUERY = `
      INSERT INTO
         news (
            data,
            image_url,
            image_name,
            user_id
         ) VALUES (
            $1, 
            $2, 
            $3, 
            ARRAY[ $4 ] 
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      text,
      fileUrl,
      fileName,
      chat_id
   )
}

module.exports = {
   news,
   userList,
   users,
   addNewAllUser,
   addNewUser
}