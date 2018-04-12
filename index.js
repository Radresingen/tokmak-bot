const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const session = require('telegraf/session')

const express = require('express')

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session({ttl:60000})); // 1 min

// Streak count
bot.on('message', (ctx, next) => {
  if(!ctx.session.streak || Date.now() - ctx.session.last > 10000){
    ctx.session.streak = 1;
  }
  else {
    ctx.session.streak++;
  }
  ctx.session.last = Date.now();
  
   
  next();
});

bot.use( (ctx, next) => {
  if( ctx.session.streak == 10){
    console.log(ctx.message.from.username, "bosyapma");
    ctx.telegram.restrictChatMember(ctx.chat.id, ctx.from.id, {
        until_date : Date.now()/1000 + 600, // 10m
        can_send_messages: false,
        can_send_media_messages: false,
        can_send_other_messages: false,
        can_send_web_page_previews: false
    }).then(()=>{
        return ctx.reply(`@${ctx.message.from.username} TOKMAKLANDIN`);
    }).catch(err => {
        console.log(err);
    });
  }
  

  next();
});


bot.on('sticker', async ctx => {
  try{
    if( ctx.session[ctx.chat.id] ){
      console.log("restrict mber", ctx.from.username);
      ctx.telegram.restrictChatMember(ctx.chat.id, ctx.from.id, {
        until_date : Date.now()/1000 + 600, // 10m
        can_send_messages: true,
        can_send_media_messages: false,
        can_send_other_messages: false,
        can_send_web_page_previews: false
      }).then(()=>{
        return ctx.reply(`@${ctx.message.from.username} TOKMAKLANDIN`);
      }).catch(err => {
        console.log(err);
      });
      ctx.deleteMessage().catch(err => {
        console.log(err);
      });
      
      ctx.session[ctx.chat.id] = false;
      
      return ctx.reply(`@${ctx.message.from.username} TOKMAKLANDIN`);
    }
    ctx.session[ctx.chat.id] = true;
  } catch (err) {
    console.log(err);
    return ctx.reply("modasi gecmedi mi bu stickerin?! :/");
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
