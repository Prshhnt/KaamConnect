import { Client, Account, Databases, Storage, Functions, ID, Query } from "https://cdn.jsdelivr.net/npm/appwrite@14.0.1/+esm";

const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: "YOUR_PROJECT_ID",
  databaseId: "YOUR_DATABASE_ID",
  workersCollectionId: "workers",
  jobsCollectionId: "jobs",
  applicationsCollectionId: "applications",
  reviewsCollectionId: "reviews",
  workerPhotosBucketId: "worker-photos"
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

function configureAppwriteRuntimeConfig(runtimeConfig = {}) {
  Object.assign(appwriteConfig, runtimeConfig);
  client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId);
}

export {
  client,
  account,
  databases,
  storage,
  functions,
  ID,
  Query,
  appwriteConfig,
  configureAppwriteRuntimeConfig
};
