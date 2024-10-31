const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const createOneTimeLink = async () => {
   try {
      const link = await bot.createChatInviteLink(process.env.CHANNEL_ID, {
         expire_date: Math.floor(Date.now() / 1000) + (60 * 60), // Link expires in 1 hour (adjust as needed)
         member_limit: 1 // Link can be used only once
      });
      console.log('One-Time Link:', link.invite_link);
      return link.invite_link;
   } catch (error) {
      console.error('Error creating invite link:', error);
   }
}

async function removeUserFromChannel(userId) {
   try {
      await bot.kickChatMember(process.env.CHANNEL_ID, userId);
      console.log(`User with ID ${userId} has been removed from the channel.`);
   } catch (error) {
      console.error('Error removing user:', error);
   }
}

module.exports = {
   bot,
   createOneTimeLink,
   removeUserFromChannel
}