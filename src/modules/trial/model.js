const {
   fetch,
   fetchALL
} = require('../../lib/postgres')

const trail = () => {
   const QUERY = `
      SELECT
         *
      FROM
         trial
      WHERE
         id DESC
   `;

   return fetchALL(QUERY)
}
const addTrial = (source, day) => {
   const QUERY = `
      INSERT INTO
         trail (
            source,
            day
         ) VALUES (
            $1, 
            $2 
         ) RETURNING *;
   `;

   return fetch(QUERY, source, day)
}
const editTrail = (id, source, day) => {
   const QUERY = `
      UPDATE
         trail
      SET
         source = $2,
         day = $3
      WHERE
         id = $1
      RETURNING *;
   `;

   return fetch(QUERY, id, source, day)
}
const deleteTrail = (id) => {
   const QUERY = `
      DELETE FROM
         trail
      WHERE
         id = $1
      RETURNING *;
   `;

   return fetch(QUERY, id)
}

module.exports = {
   trail,
   addTrial,
   editTrail,
   deleteTrail
}