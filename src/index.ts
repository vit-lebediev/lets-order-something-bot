import TelegramBot, { SendMessageOptions, KeyboardButton, ReplyKeyboardMarkup } from 'node-telegram-bot-api';

const BOT_TOKEN : string | undefined = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    throw new Error("You HAVE to run a bot with BOT_TOKEN env var set!");
}

const LOSBot = new TelegramBot(BOT_TOKEN, { polling: true });

LOSBot.onText(/^\/start/, (msg) => {
    console.log(`/start command received. User name: ${ msg.from?.first_name }, ${ msg.from?.last_name }, User id: ${ msg.from?.id }, username: ${ msg.from?.username }`, );

    const firstButton : KeyboardButton = { text: 'Simple button' };

    const replyMarkup : ReplyKeyboardMarkup = {
        keyboard: [[firstButton]]
    };

    const messageOptions : SendMessageOptions = {
        reply_markup: replyMarkup
    };

    return LOSBot.sendMessage(msg.chat.id, `Let' start this PAR-TEY!`, messageOptions);
});

LOSBot.onText(/^\/help/, (msg) => {
    return LOSBot.sendMessage(msg.chat.id, 'Help is not supported yet');
});

LOSBot.onText(/^\/settings/, (msg) => {
    return LOSBot.sendMessage(msg.chat.id, 'Settings currently are not supported. TBD.');
});
