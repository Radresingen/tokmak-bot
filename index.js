const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const session = require('telegraf/session')

const express = require('express')

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session({ttl:60000})); // 1 min

// Streak count
bot.use(ctx => {
  if(!ctx.session.strike || Date.now() - ctx.session.last > 10000){
    ctx.session.strike = 1;
  }
  else {
    ctx.session.strike++;
  }
  ctx.session.last = Date.now();
  console.log(`${ctx.message.from.username} streak ${ctx.session.strike}`);
});

bot.use(ctx => {
  console.log(ctx.message.from.username, "bosyapma");
  if( ctx.session.strike > 5 )
    ctx.reply(`Yaa boş yapma @${ctx.message.from.username}`);
})

bot.on('sticker', async ctx => {
  try{
    if( ctx.session[ctx.chat.id] ){
      await ctx.telegram.restrictChatMember(ctx.chat.id, ctx.from.id, {
        until_date : Date.now() + 600000, // 10m
        can_send_messages: true,
        can_send_media_messages: false,
        can_send_other_messages: false,
        can_send_web_page_previews: false
      });
      //await ctx.deleteMessage();
      
      ctx.session[ctx.chat.id] = false;
      
      return ctx.reply(`@${ctx.message.from.username} TOKMAKLANDIN`);
    }
    ctx.session[ctx.chat.id] = true;
  } catch (err) {
    console.log(err);
  }
});

bot.use(ctx => {
  ctx.session[ctx.chat.id] = false;
});

bot.telegram.setWebhook(process.env.BASE+process.env.BOT_TOKEN);

const app = express()
app.get('/', (req, res) => res.send('Hello World!'))
app.use(bot.webhookCallback('/'+process.env.BOT_TOKEN));
app.listen(process.env.PORT, () => {
  console.log('Example app listening on port!')
})
