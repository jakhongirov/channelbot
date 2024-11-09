require('dotenv').config();
const model = require('./model')
const path = require('path')
const FS = require('../../lib/fs/fs')
const fs = require('fs')
const {
   bot
} = require('../../lib/bot');

module.exports = {
   GET: async (req, res) => {
      try {
         const {
            page,
            limit
         } = req.query

         if (page && limit) {
            const news = await model.news(page, limit)

            if (news?.length > 0) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: news
               })
            } else {
               return res.status(404).json({
                  status: 404,
                  message: "Not found"
               })
            }
         } else {
            return res.status(400).json({
               status: 400,
               message: "Bad request"
            })
         }

      } catch (error) {
         console.log(error);
         return res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   },

   ALL_USERS: async (req, res) => {
      try {
         const uploadPhoto = req.file;
         const {
            user_subcribe,
            text,
            source
         } = req.body
         const users = await model.users(user_subcribe, source)
         const formattedText = text
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '\n')
            .replace(/<br\s*\/?>/g, '\n');
         let user_count = 0
         const fileName = uploadPhoto ? uploadPhoto?.filename : null;
         const fileUrl = uploadPhoto ? `${process.env.BACKEND_URL}/${uploadPhoto?.filename}` : null
         const mimeType = req.file.mimetype;

         if (uploadPhoto) {
            if (mimeType.startsWith('image/')) {
               const imagePath = path.resolve(__dirname, '..', '..', '..', 'public', 'images', fileName);
               for (const user of users) {
                  bot.sendPhoto(user?.chat_id, fs.readFileSync(imagePath), {
                     parse_mode: "HTML",
                     caption: formattedText
                  }).then(async () => {
                     user_count += 1
                  })
               }
            } else if (mimeType.startsWith('video/')) {
               const videoPath = path.resolve(__dirname, '..', '..', '..', 'public', 'images', fileName);
               for (const user of users) {
                  bot.sendVideo(user?.chat_id, fs.readFileSync(videoPath), {
                     parse_mode: "HTML",
                     caption: formattedText
                  }).then(async () => {
                     user_count += 1
                  })
               }
            }
         } else {
            for (const user of users) { // Remove <p> tags
               bot.sendMessage(user?.chat_id, formattedText, {
                  parse_mode: "HTML"
               }).then(() => user_count += 1);
            }
         }

         const addNewAllUser = await model.addNewAllUser(
            text,
            fileUrl,
            fileName,
            source,
            user_subcribe,
            user_count,
         )

         if (addNewAllUser) {
            return res.status(200).json({
               status: 200,
               message: "Success"
            })
         } else {
            return res.status(400).json({
               status: 400,
               message: "Bad request"
            })
         }

      } catch (error) {
         console.log(error);
         return res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   },

   SINGLE_USER: async (req, res) => {
      try {
         const uploadPhoto = req.file;
         const {
            chat_id,
            text
         } = req.body
         const formattedText = text
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '\n')
            .replace(/<br\s*\/?>/g, '\n');
         const fileName = uploadPhoto?.filename;
         const fileUrl = `${process.env.BACKEND_URL}/${uploadPhoto?.filename}`
         const mimeType = req.file.mimetype;

         if (uploadPhoto) {

            if (mimeType.startsWith('image/')) {
               const imagePath = path.resolve(__dirname, '..', '..', '..', 'public', 'images', fileName);
               bot.sendPhoto(chat_id, fs.readFileSync(imagePath), {
                  parse_mode: "HTML",
                  caption: formattedText
               }).then(async () => {

               })
            } else if (mimeType.startsWith('video/')) {
               const videoPath = path.resolve(__dirname, '..', '..', '..', 'public', 'images', fileName);

               bot.sendVideo(chat_id, fs.readFileSync(videoPath), {
                  parse_mode: "HTML",
                  caption: formattedText
               }).then(async () => {

               })
            }
         } else {
            bot.sendMessage(chat_id, formattedText, {
               parse_mode: "HTML"
            });
         }

         const addNewUser = await model.addNewUser(
            text,
            fileUrl,
            fileName,
            chat_id
         )

         if (addNewUser) {
            return res.status(200).json({
               status: 200,
               message: "Success"
            })
         } else {
            return res.status(400).json({
               status: 400,
               message: "Bad request"
            })
         }

      } catch (error) {
         console.log(error);
         return res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   }
}