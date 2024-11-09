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
      ORDER BY
         id DESC;
   `;

   return fetchALL(QUERY)
}
const addTrial = (source, day) => {
   const QUERY = `
      INSERT INTO
         trial (
            source,
            day
         ) VALUES (
            $1, 
            $2 
         ) RETURNING *;
   `;

   return fetch(QUERY, source, day)
}
const editTrial = (id, source, day) => {
   const QUERY = `
      UPDATE
         trial
      SET
         source = $2,
         day = $3
      WHERE
         id = $1
      RETURNING *;
   `;

   return fetch(QUERY, id, source, day)
}
const deleteTrial = (id) => {
   const QUERY = `
      DELETE FROM
         trial
      WHERE
         id = $1
      RETURNING *;
   `;

   return fetch(QUERY, id)
}

module.exports = {
   trail,
   addTrial,
   editTrial,
   deleteTrial
}