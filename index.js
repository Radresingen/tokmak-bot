const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const session = require('telegraf/session')

const express = require('express')

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session({ttl:60000})); // 1 min

bot.on('sticker', async ctx => {
  try{
    if( ctx.session[ctx.chat.id] ){
      await ctx.telegram.restrictChatMember(ctx.chat.id, ctx.from.id, {
        until_date : Date.now() + 3600000, // 1h
        can_send_messages: true,
        can_send_media_messages: false,
        can_send_other_messages: false,
        can_send_web_page_previews: false
      });
      return ctx.reply(`@${ctx.message.from.username} TOKMAKLANDIN`);
    }
    ctx.session[ctx.chat.id] = true;
  } catch (err) {
    console.log(err);
  }
});

bot.use(ctx => {
  ctx.session[ctx.chat.id] = false;
})

bot.telegram.setWebhook(process.env.BASE+process.env.BOT_TOKEN);

const app = express()
app.get('/', (req, res) => res.send('Hello World!'))
app.use(bot.webhookCallback('/'+process.env.BOT_TOKEN));
app.listen(process.env.PORT || 80, () => {
  console.log('Example app listening on port!')
})
