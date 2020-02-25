import fs from 'fs';
import path from 'path';
import * as csv from 'fast-csv'; // eslint-disable-line import/no-extraneous-dependencies
import { Collection } from 'mongodb';

import { FOOD_CATEGORIES, KITCHEN_CATEGORIES } from '../src/Constants';
import LosMongoClient from '../src/LosMongoClient';
import Logger from '../src/Logger';

const logger = Logger.child({ module: 'parsePlaces' });

setTimeout(async () => {
  // @ts-ignore
  const placesCollection: Collection = LosMongoClient.dbHandler.collection('places');

  await placesCollection.remove({});

  const warnings: string[] = [];

  fs.createReadStream(path.resolve(__dirname, '..', 'resources', 'places.csv'))
    .pipe(csv.parse({ headers: true }))
    .on('error', (error) => logger.error(error))
    .on('data', async (row) => {
      logger.info('Inserting Row:');
      console.log(row);

      const insertRow = row;

      if (insertRow.categories !== '') {
        insertRow.categories = row.categories.split(',');

        // get rid of duplicates
        // @see https://stackoverflow.com/a/14438954/852399
        insertRow.categories = insertRow.categories.filter((value: string, index: number, self: string) => self.indexOf(value) === index);

        for (let i = 0; i < insertRow.categories.length; i += 1) {
          const cat = insertRow.categories[i];

          if (!(cat in FOOD_CATEGORIES)) {
            const warningText = `No such category supported: ${ cat }, found in ${ insertRow.name }`;
            warnings.push(warningText);
          }
        }
      }

      if (insertRow.kitchens !== '') {
        insertRow.kitchens = row.kitchens.split(',');

        // get rid of duplicates
        // @see https://stackoverflow.com/a/14438954/852399
        insertRow.kitchens = insertRow.kitchens.filter((value: string, index: number, self: string) => self.indexOf(value) === index);

        for (let i = 0; i < insertRow.kitchens.length; i += 1) {
          const kitchen = insertRow.kitchens[i];

          if (!(kitchen in KITCHEN_CATEGORIES)) {
            const warningText = `No such kitchen supported: ${ kitchen }, found in ${ insertRow.name }`;
            warnings.push(warningText);
          }
        }
      }

      await placesCollection.insertOne(insertRow);
    })
    .on('end', async (rowCount: number) => {
      logger.info(`Parsed ${ rowCount } rows`);

      // logger.info('Reading documents from Mongo collection...');
      //
      // const documents = placesCollection.find({});
      //
      // console.log(await documents.toArray());

      for (let i = 0; i < warnings.length; i += 1) {
        logger.warn(warnings[i]);
      }

      process.exit(0);
    });
}, 1000);
