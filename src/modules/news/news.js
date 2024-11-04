require('dotenv').config();
const model = require('./model')
const path = require('path')
const FS = require('../../lib/fs/fs')
const fs = require('fs')
const {
   bot
} = require('../../lib/bot')

module.exports = {
   ALL_USERS: async (req, res) => {
      try {
         const uploadPhoto = req.file;
         const {
            user_subcribe,
            text
         } = req.body
         const users = await model.users(user_subcribe)
         const formattedText = text.replace(/<\/?p>/g, '');

         if (uploadPhoto) {
            const fileName = uploadPhoto?.filename;
            const mimeType = req.file.mimetype;

            if (mimeType.startsWith('image/')) {
               const imagePath = path.resolve(__dirname, '..', '..', '..', 'public', 'images', fileName);
               for (const user of users) {
                  bot.sendPhoto(user?.chat_id, fs.readFileSync(imagePath), {
                     parse_mode: "HTML",
                     caption: formattedText
                  }).then(async () => {
                     const deleteImg = new FS(path.resolve(__dirname, '..', '..', '..', 'public', 'images', `${fileName}`))
                     deleteImg.delete()
                  })
               }
            } else if (mimeType.startsWith('video/')) {
               const videoPath = path.resolve(__dirname, '..', '..', '..', 'public', 'images', fileName);
               for (const user of users) {
                  bot.sendVideo(user?.chat_id, fs.readFileSync(videoPath), {
                     parse_mode: "HTML",
                     caption: formattedText
                  }).then(async () => {
                     const deleteVideo = new FS(path.resolve(__dirname, '..', '..', '..', 'public', 'images', `${fileName}`))
                     deleteVideo.delete()
                  })
               }
            }
         } else {
            for (const user of users) { // Remove <p> tags
               bot.sendMessage(user?.chat_id, formattedText, {
                  parse_mode: "HTML"
               });
            }
         }

         return res.status(200).json({
            status: 200,
            message: "Success"
         })

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
         const formattedText = text.replace(/<\/?p>/g, ''); // Remove <p> tags
         console.log(req)
         console.log(req.file)

         if (uploadPhoto) {
            const fileName = uploadPhoto?.filename;
            const mimeType = req.file.mimetype;
            if (mimeType.startsWith('image/')) {
               const imagePath = path.resolve(__dirname, '..', '..', '..', 'public', 'images', fileName);
               bot.sendPhoto(chat_id, fs.readFileSync(imagePath), {
                  parse_mode: "HTML",
                  caption: formattedText
               }).then(async () => {
                  const deleteImg = new FS(path.resolve(__dirname, '..', '..', '..', 'public', 'images', `${fileName}`))
                  deleteImg.delete()
               })
            } else if (mimeType.startsWith('video/')) {
               const videoPath = path.resolve(__dirname, '..', '..', '..', 'public', 'images', fileName);

               bot.sendVideo(chat_id, fs.readFileSync(videoPath), {
                  parse_mode: "HTML",
                  caption: formattedText
               }).then(async () => {
                  const deleteVideo = new FS(path.resolve(__dirname, '..', '..', '..', 'public', 'images', `${fileName}`))
                  deleteVideo.delete()
               })
            }
         } else {
            bot.sendMessage(chat_id, formattedText, {
               parse_mode: "HTML"
            });
         }

         return res.status(200).json({
            status: 200,
            message: "Success"
         })

      } catch (error) {
         console.log(error);
         return res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   }
}