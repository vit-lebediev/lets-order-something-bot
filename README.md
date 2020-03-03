# lets-order-something-bot
The Bot to help choose the food delivery place for a pleasant evening.

# How to start Development
1. Clone the repo
2. Install deps: `npm i`
3. Create `.env` file with crucial constants:
```
LOS_BOT_ENV=DEV

LOS_BOT_TG_TOKEN=<telegram_bog_api_token>
LOS_BOT_OC_TOKEN=<open_cage_geocoder_api_token>

LOS_REDIS_HOST=<redis_host>
LOS_REDIS_PORT=<redis_port>

LOS_MONGO_HOST=<mongo_host>
LOS_MONGO_PORT=<mongo_port>
LOS_MONGO_DB=<mongo_db>
LOS_MONGO_USER=<mongo_user>
LOS_MONGO_PASS=<mongo_pass>
```

4. run `docker-compose up` (in separate window)
5. run `npm run watchts` (in separate window)
6. run `npm start` (in separate window)
