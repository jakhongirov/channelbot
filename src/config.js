function addOneMonthToCurrentDate() {
   const date = new Date();
   date.setMonth(date.getMonth() + 1);

   const year = date.getUTCFullYear();
   const month = String(date.getUTCMonth() + 1).padStart(2, '0');
   const day = String(date.getUTCDate()).padStart(2, '0');

   return `${year}-${month}-${day}`;
}

function addDayToCurrentDate(expire_day) {
   const date = new Date();

   // Add days
   date.setDate(date.getDate() + Number(expire_day));

   // Apply Uzbekistan timezone offset (UTC+5)
   const uzbekistanOffset = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
   const uzbekistanTime = new Date(date.getTime() + uzbekistanOffset);

   const year = uzbekistanTime.getUTCFullYear();
   const month = String(uzbekistanTime.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
   const day = String(uzbekistanTime.getUTCDate()).padStart(2, '0');

   return `${year}-${month}-${day}`;
}

module.exports = {
   addOneMonthToCurrentDate,
   addDayToCurrentDate
}