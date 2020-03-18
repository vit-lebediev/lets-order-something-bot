import path from 'path';
import { URL } from 'url';
import * as csv from 'fast-csv'; // eslint-disable-line import/no-extraneous-dependencies
import { Collection } from 'mongodb';

import { FOOD_CATEGORIES, KITCHEN_CATEGORIES } from '../src/Constants';
import LosMongoClient, { PLACES_COLLECTION } from '../src/LosMongoClient';
import Logger from '../src/Logger';

const logger = Logger.child({ module: 'parsePlaces' });

type InsertRow = {
  num_id: number, // eslint-disable-line camelcase
  city: string,
  name: string,
  categories: string | string[],
  kitchens: string | string[],
  added: string,
  url: string,
  notes: string
}

setTimeout(async () => {
  // @ts-ignore
  const placesCollection: Collection = LosMongoClient.dbHandler.collection(PLACES_COLLECTION);

  const warnings: string[] = [];
  const urlsAdded: string[] = [];
  let newPlacesAdded: number = 0;

  csv.parseFile(path.resolve(__dirname, '..', 'resources', 'places.csv'), { headers: true })
    .on('error', (error) => logger.error(error))
    .on('data', async (row) => {
      logger.info('Inserting Row:');
      console.log(row); // for debug purposes

      const insertRow: InsertRow = row;

      // duplicate categories
      if (insertRow.categories !== '') {
        insertRow.categories = row.categories.split(',') as [];

        // get rid of duplicates
        // @see https://stackoverflow.com/a/14438954/852399
        insertRow.categories = insertRow.categories.filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);

        for (let i = 0; i < insertRow.categories.length; i += 1) {
          const cat = insertRow.categories[i];

          if (!(cat in FOOD_CATEGORIES)) {
            const warningText = `No such category supported: ${ cat }, found in ${ insertRow.name }`;
            warnings.push(warningText);
          }
        }
      }

      // duplicate kitchens
      if (insertRow.kitchens !== '') {
        insertRow.kitchens = row.kitchens.split(',') as [];

        // get rid of duplicates
        // @see https://stackoverflow.com/a/14438954/852399
        insertRow.kitchens = insertRow.kitchens.filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);

        for (let i = 0; i < insertRow.kitchens.length; i += 1) {
          const kitchen = insertRow.kitchens[i];

          if (!(kitchen in KITCHEN_CATEGORIES)) {
            const warningText = `No such kitchen supported: ${ kitchen }, found in ${ insertRow.name }`;
            warnings.push(warningText);
          }
        }
      }

      // duplicate places (by URL)
      const placeUrl: URL = new URL(insertRow.url);
      if (urlsAdded.indexOf(placeUrl.hostname) !== -1) {
        // already added this URL! Add warning
        warnings.push(`Place with ${ placeUrl.href } url has been already added! Found in ${ insertRow.name } (${ insertRow.num_id })`);
      }

      urlsAdded.push(placeUrl.hostname);

      const res = await placesCollection.updateOne(
          { num_id: insertRow.num_id },
          { $set: insertRow },
          { upsert: true }
      );

      newPlacesAdded += res.upsertedCount;
    })
    .on('end', async (rowCount: number) => {
      logger.info(`Parsed ${ rowCount } rows from csv file`);

      logger.warn('Reading documents from Mongo collection, to initiate batch insert (THIS IS QUICKFIX FOR A BUG)...');
      const documents = placesCollection.find({});

      logger.info(`Places currently in a database: ${ (await documents.toArray()).length }`);
      logger.info(`New places added: ${ newPlacesAdded }`);

      for (let i = 0; i < warnings.length; i += 1) {
        logger.warn(warnings[i]);
      }

      process.exit(0);
    });
}, 1000);
