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
const foundNews = (id) => {
   const QUERY = `
      SELECT
         *
      FROM
         news
      WHERE
         id = $1;
   `;

   return fetch(QUERY, id)
}
const userList = (user_id) => {
   if (!user_id || user_id.length === 0) return [];

   const id = user_id.map((e) => `${e}`).join(', ');
   const QUERY = `
      SELECT
         *
      FROM
         users
      WHERE
         chat_id IN (${id});
   `;

   return fetchALL(QUERY);
};
const users = (user_subcribe, source) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      ${user_subcribe != 'all' && source != 'all' ? (
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
      ) : user_subcribe == 'all' && source != 'all' ? (
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
            ARRAY[ $4 ]::bigint[] 
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
   foundNews,
   userList,
   users,
   addNewAllUser,
   addNewUser
}