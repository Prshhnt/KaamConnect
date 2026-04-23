/**
 * Add attributes to Appwrite collections
 * Run with: node create-attributes.js
 */

const APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const PROJECT_ID = "69d7693c0026a410e676";
const DATABASE_ID = "69e9749100232561665e";
const API_KEY = "standard_7b7826ac5a982ab73972190840a181e5a62504b0ed4ee5a95303ff95c3d24ea8d8032a1ab4501a1e276834f029b1f4dbc97b9aa540af226c35f01b522b4cc76e5111f453b7fb9360d71c836f429ee61be6fa81dc9be230e87ac54e5847430a74a9478f1f11fab586c00378d24427e0d80b5f9f5dd81ec2e6b05e56b9000d6f05";

const collectionsAttributes = {
  cities: [
    { name: "name", type: "string", required: true }
  ],
  categories: [
    { name: "id", type: "string", required: true },
    { name: "name", type: "string", required: true },
    { name: "icon", type: "string", required: false },
    { name: "description", type: "string", required: false }
  ],
  workers: [
    { name: "name", type: "string", required: true },
    { name: "email", type: "string", required: true },
    { name: "phone", type: "string", required: true },
    { name: "category", type: "string", required: true },
    { name: "city", type: "string", required: true },
    { name: "rate", type: "integer", required: true },
    { name: "experience", type: "integer", required: false },
    { name: "available", type: "boolean", required: false },
    { name: "rating", type: "double", required: false },
    { name: "reviewsCount", type: "integer", required: false },
    { name: "photo", type: "string", required: false },
    { name: "languages", type: "string", required: false },
    { name: "skills", type: "string", required: false },
    { name: "about", type: "string", required: false },
    { name: "userId", type: "string", required: false }
  ],
  jobs: [
    { name: "title", type: "string", required: true },
    { name: "category", type: "string", required: true },
    { name: "city", type: "string", required: true },
    { name: "rate", type: "integer", required: true },
    { name: "duration", type: "string", required: true },
    { name: "status", type: "string", required: true },
    { name: "employerId", type: "string", required: true },
    { name: "description", type: "string", required: false },
    { name: "applicationsCount", type: "integer", required: false },
    { name: "createdAt", type: "string", required: false },
    { name: "updatedAt", type: "string", required: false }
  ],
  applications: [
    { name: "jobId", type: "string", required: true },
    { name: "workerId", type: "string", required: true },
    { name: "status", type: "string", required: false },
    { name: "appliedAt", type: "string", required: false }
  ],
  reviews: [
    { name: "workerId", type: "string", required: true },
    { name: "employerId", type: "string", required: true },
    { name: "rating", type: "double", required: true },
    { name: "comment", type: "string", required: false },
    { name: "jobId", type: "string", required: false },
    { name: "createdAt", type: "string", required: false }
  ]
};

async function createAttribute(collectionId, attr) {
  const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${collectionId}/attributes/${attr.type}`;
  
  try {
    const payload = {
      key: attr.name,
      required: attr.required
    };

    // String and double types need size parameter
    if (attr.type === 'string') {
      payload.size = 255;
    } else if (attr.type === 'double') {
      payload.size = 255;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": PROJECT_ID,
        "X-Appwrite-Key": API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.code === 409) {
        return { success: true, existed: true };
      }
      throw new Error(data.message);
    }

    return { success: true, existed: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function setupAttributes() {
  console.log("🚀 Adding attributes to collections...\n");

  let totalAdded = 0;
  let totalExisted = 0;

  for (const [collectionId, attributes] of Object.entries(collectionsAttributes)) {
    console.log(`📝 ${collectionId}:`);
    
    for (const attr of attributes) {
      const result = await createAttribute(collectionId, attr);
      
      if (result.success) {
        if (result.existed) {
          console.log(`  ⚠️  ${attr.name} (already exists)`);
          totalExisted++;
        } else {
          console.log(`  ✅ ${attr.name}`);
          totalAdded++;
        }
      } else {
        console.log(`  ❌ ${attr.name}: ${result.error}`);
      }
    }
    console.log();
  }

  console.log(`✅ Complete: ${totalAdded} added, ${totalExisted} already existed`);
}

setupAttributes().catch(console.error);
