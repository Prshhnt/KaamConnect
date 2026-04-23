import { Client, Account, Databases, Storage, Functions, ID, Query } from "https://cdn.jsdelivr.net/npm/appwrite@14.0.1/+esm";

const appwriteConfig = {
  endpoint: "https://sgp.cloud.appwrite.io/v1",
  projectId: "69d7693c0026a410e676",
  databaseId: "69e9749100232561665e",
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

// Database fetching functions
async function fetchWorkers(filters = {}) {
  try {
    const queries = [];
    
    if (filters.city) {
      queries.push(Query.equal("city", filters.city));
    }
    if (filters.category) {
      queries.push(Query.equal("category", filters.category));
    }
    if (filters.available !== undefined) {
      queries.push(Query.equal("available", filters.available));
    }
    if (filters.minRating !== undefined) {
      queries.push(Query.greaterThanOrEqual("rating", filters.minRating));
    }

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.workersCollectionId,
      queries.length > 0 ? queries : []
    );
    
    return response.documents;
  } catch (error) {
    console.error("[DB:fetchWorkers]", error);
    return [];
  }
}

async function fetchWorkerById(workerId) {
  try {
    return await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.workersCollectionId,
      workerId
    );
  } catch (error) {
    console.error("[DB:fetchWorkerById]", error);
    return null;
  }
}

async function fetchJobs(filters = {}) {
  try {
    const queries = [];
    
    if (filters.city) {
      queries.push(Query.equal("city", filters.city));
    }
    if (filters.category) {
      queries.push(Query.equal("category", filters.category));
    }
    if (filters.status) {
      queries.push(Query.equal("status", filters.status));
    }

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.jobsCollectionId,
      queries.length > 0 ? queries : []
    );
    
    return response.documents;
  } catch (error) {
    console.error("[DB:fetchJobs]", error);
    return [];
  }
}

async function fetchJobById(jobId) {
  try {
    return await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.jobsCollectionId,
      jobId
    );
  } catch (error) {
    console.error("[DB:fetchJobById]", error);
    return null;
  }
}

async function fetchReviewsForWorker(workerId) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      [Query.equal("workerId", workerId)]
    );
    
    return response.documents;
  } catch (error) {
    console.error("[DB:fetchReviewsForWorker]", error);
    return [];
  }
}

async function createApplication(jobId, workerId) {
  try {
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.applicationsCollectionId,
      ID.unique(),
      {
        jobId,
        workerId,
        status: "pending",
        appliedAt: new Date().toISOString()
      }
    );
    
    return response;
  } catch (error) {
    console.error("[DB:createApplication]", error);
    return null;
  }
}

async function createJob(jobData) {
  try {
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.jobsCollectionId,
      ID.unique(),
      jobData
    );
    
    return response;
  } catch (error) {
    console.error("[DB:createJob]", error);
    return null;
  }
}

async function updateWorkerProfile(workerId, data) {
  try {
    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.workersCollectionId,
      workerId,
      data
    );
    
    return response;
  } catch (error) {
    console.error("[DB:updateWorkerProfile]", error);
    return null;
  }
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
  configureAppwriteRuntimeConfig,
  fetchWorkers,
  fetchWorkerById,
  fetchJobs,
  fetchJobById,
  fetchReviewsForWorker,
  createApplication,
  createJob,
  updateWorkerProfile
};
