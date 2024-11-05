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
const statisticsSource = () => {
   const QUERY = `
      SELECT
         source,
         ROUND((COUNT(*) * 100.0) / (SELECT COUNT(*) FROM users), 2) AS percentage,
         const(*)
      FROM
         users
      GROUP BY
         source
      ORDER BY
         percentage DESC;
   `;

   return fetchALL(QUERY)
}
const statisticsIncrease = () => {
   const QUERY = `
      WITH monthly_user_counts AS (
         SELECT
            DATE_TRUNC('month', create_at) AS month,
            COUNT(chat_id) AS user_count
         FROM
            users
         GROUP BY
            DATE_TRUNC('month', create_at)
      ),
      all_months AS (
         SELECT
            DATE_TRUNC('month', generate_series) AS month
         FROM
            GENERATE_SERIES(
                  DATE_TRUNC('year', CURRENT_DATE),
                  DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '11 months',
                  '1 month'
            ) AS generate_series
      ),
      monthly_growth AS (
         SELECT
            all_months.month,
            COALESCE(muc.user_count, 0) AS user_count,
            LAG(COALESCE(muc.user_count, 0)) OVER (ORDER BY all_months.month) AS previous_count
         FROM
            all_months
         LEFT JOIN
            monthly_user_counts muc ON all_months.month = muc.month
      )
      SELECT
         TO_CHAR(month, 'Month') AS month,
         user_count,
         CASE
            WHEN previous_count = 0 OR user_count = 0 THEN NULL
            ELSE ROUND(((user_count - previous_count) * 100.0 / previous_count), 2)
         END AS percentage_increase
      FROM
         monthly_growth
      ORDER BY
         month;
   `;

   return fetchALL(QUERY)
}

module.exports = {
   users,
   foundUser,
   allUser,
   payedUsers,
   statisticsSource,
   statisticsIncrease
}