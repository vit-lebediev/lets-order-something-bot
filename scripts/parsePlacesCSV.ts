import fs from 'fs';
import path from 'path';
import * as csv from 'fast-csv'; // eslint-disable-line import/no-extraneous-dependencies

import LosMongoClient from '../src/LosMongoClient';
import Logger from '../src/Logger';

const logger = Logger.child({ module: 'parsePlaces' });

setTimeout(async () => {
  const placesCollection = LosMongoClient.dbHandler.collection('places');

  await placesCollection.remove({});

  fs.createReadStream(path.resolve(__dirname, '..', 'resources', 'places.csv'))
    .pipe(csv.parse({ headers: true }))
    .on('error', (error) => logger.error(error))
    .on('data', async (row) => {
      logger.info('Inserting Row:');
      console.log(row);

      await placesCollection.insertOne(row);
    })
    .on('end', async (rowCount: number) => {
      logger.info(`Parsed ${ rowCount } rows`);

      logger.info('Reading documents from Mongo collection...');

      const documents = placesCollection.find({});

      console.log(await documents.toArray());

      process.exit(0);
    });
}, 1000);
