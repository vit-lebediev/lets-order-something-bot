# lets-order-something-bot
The Bot to help order some food for a pleasant evening

# How to start Development
1. Clone the repo
2. Install deps: `npm i`
3. Create `.los_bog_env` file with crucial constants:
```
LOS_BOT_TG_TOKEN=<telegram_bog_api_token>
LOS_BOT_OC_TOKEN=<open_cage_geocoder_api_token>

LOS_REDIS_HOST=<redis_host>
LOS_REDIS_PORT=<redis_port>
```
4. run `docker-compose up`
5. run `npm run watchts`
6. run `npm start`
