# lets-order-something-bot
The Bot to help choose the food delivery place for a pleasant evening.

# How to start Development
1. Clone the repo
2. Install deps: `npm i`
3. Create `.env` file with crucial constants:
```
LOS_BOT_ENV=DEV
NTBA_FIX_319=1

LOS_BOT_TG_TOKEN=<telegram_bot_api_token>
LOS_BOT_OC_TOKEN=<open_cage_geocoder_api_token>

LOS_REDIS_HOST=<redis_host>
LOS_REDIS_PORT=<redis_port>

LOS_MONGO_HOST=<mongo_host>
LOS_MONGO_PORT=<mongo_port>
LOS_MONGO_DB=<mongo_db>
LOS_MONGO_USER=<mongo_user>
LOS_MONGO_PASS=<mongo_pass>
```
4. run `npm run stack` (in separate window)
5. run `npm run watchts` (in separate window)
6. run `npm start` (in separate window)
7. run `npm run parsePlaces` (in separate window)

# Environment Variables
`NTBA_FIX_319` should be set in order to address [promise cancellation issue](https://github.com/yagop/node-telegram-bot-api/issues/319#issuecomment-324963294).

# Bot menu list
The bot supports next hierarchy of menu (each corresponds to a state user in):
1. City select Menu
2. Section select Menu
3. I Feel Lucky Menu
4. Kitchen Categories Menu
4.1 Kitchen Menu
5. Food Categories Menu
5.1 Food Menu
6. Feedback Menu
