import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN : string | undefined = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    throw new Error("You HAVE to run a bot with BOT_TOKEN env var set!");
}

const LOSBot = new TelegramBot(BOT_TOKEN, { polling: true });

LOSBot.on('message', (msg) => {
    const chatId = msg.chat.id;

    console.log(`ChatID: ${ chatId }`);
    console.log(`Message text: ${ msg.text }`);

    return LOSBot.sendMessage(chatId, `Received your message: ${ msg.text }`);
});
