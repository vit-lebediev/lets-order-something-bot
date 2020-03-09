import { Message, User } from 'node-telegram-bot-api';
import { Collection } from 'mongodb';
import { BaseLogger } from 'pino';

import LosMongoClient from '../LosMongoClient';
import UserProfileInterface from './UserProfileInterface';
import Logger from '../Logger';

const USER_PROFILE_COLLECTION = 'userProfiles';

export default class UserProfileManager {
  static getUserFromMessage (msg: Message): User {
    const user: User | undefined = msg.from;

    if (user === undefined) throw new Error("User is not found in message 'from' field");

    return user;
  }

  static async updateUserProfile (tgUserId: number, newUserProfile: UserProfileInterface): Promise<boolean> {
    const updatedUserProfile: UserProfileInterface = newUserProfile;

    updatedUserProfile.lastUpdated = Math.round(Date.now() / 1000);

    const logger: BaseLogger = Logger.child({ module: 'UserProfileManager', userId: updatedUserProfile.tgUserId });

    logger.info(`Storing user profile ${ updatedUserProfile.tgUserId } in Mongo`);

    // @ts-ignore
    const userProfileCollection: Collection = LosMongoClient.dbHandler.collection(USER_PROFILE_COLLECTION);

    await userProfileCollection.replaceOne(
        { tgUserId: updatedUserProfile.tgUserId },
        updatedUserProfile,
        {
          upsert: true
        }
    );

    return Promise.resolve(true);
  }

  static async getUserProfile (msg: Message): Promise<UserProfileInterface> {
    const user: User = UserProfileManager.getUserFromMessage(msg);

    const userProfile: UserProfileInterface | null = await UserProfileManager.getUserProfileById(user.id);

    if (userProfile === null) {
      throw new Error('User profile not found');
    }

    return userProfile;
  }

  static async getUserProfileById (tgUserId: number): Promise<UserProfileInterface | null> {
    // @ts-ignore
    const usersCollection: Collection = LosMongoClient.dbHandler.collection(USER_PROFILE_COLLECTION);

    const user = await usersCollection.findOne({
      tgUserId
    });

    if (!user) return null;

    // strip MongoDB _id field from our future UserProfile object
    delete user._id; // eslint-disable-line no-underscore-dangle

    return {
      ...user
    } as UserProfileInterface;
  }
}
