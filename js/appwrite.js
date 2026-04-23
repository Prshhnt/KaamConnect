import {
  client,
  account,
  databases,
  storage,
  functions,
  appwriteConfig,
  ID,
  Query
} from "../appwrite.js";

const DB_ID = appwriteConfig.databaseId;
const BUCKET_ID = "profile_photos";

export {
  client as client_,
  account,
  databases as db,
  storage,
  functions,
  DB_ID,
  BUCKET_ID,
  ID,
  Query
};
