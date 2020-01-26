import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN : string | undefined = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    throw new Error("You HAVE to run a bot with BOT_TOKEN env var set!");
}

const LOSBot = new TelegramBot(BOT_TOKEN, { polling: true });

LOSBot.onText(/^\/start/, (msg) => {
    return LOSBot.sendMessage(msg.chat.id, `Let' start this PAR-TEY!`);
});

LOSBot.onText(/^\/help/, (msg) => {
    return LOSBot.sendMessage(msg.chat.id, 'Help is not supported yet');
});

LOSBot.onText(/^\/settings/, (msg) => {
    return LOSBot.sendMessage(msg.chat.id, 'Settings currently are not supported. TBD.');
});

// LOSBot.on('message', (msg) => {
//     const chatId : number = msg.chat.id;
//
//     console.log(`ChatID: ${ chatId }`);
//     console.log(`Message text: ${ msg.text }`);
//
//     return LOSBot.sendMessage(chatId, `Received your message: ${ msg.text }`);
// });
