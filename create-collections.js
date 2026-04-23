/**
 * Create collections in Appwrite Database
 * Run with: node create-collections.js
 */

const APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const PROJECT_ID = "69d7693c0026a410e676";
const DATABASE_ID = "69e9749100232561665e";
const API_KEY = "standard_7b7826ac5a982ab73972190840a181e5a62504b0ed4ee5a95303ff95c3d24ea8d8032a1ab4501a1e276834f029b1f4dbc97b9aa540af226c35f01b522b4cc76e5111f453b7fb9360d71c836f429ee61be6fa81dc9be230e87ac54e5847430a74a9478f1f11fab586c00378d24427e0d80b5f9f5dd81ec2e6b05e56b9000d6f05";

async function createCollection(collectionId, collectionName) {
  const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections`;
  
  try {
    console.log(`📝 Creating collection: ${collectionName} (ID: ${collectionId})...`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": PROJECT_ID,
        "X-Appwrite-Key": API_KEY
      },
      body: JSON.stringify({
        collectionId: collectionId,
        name: collectionName,
        permissions: [
          "create(\"any\")",
          "read(\"any\")",
          "update(\"any\")",
          "delete(\"any\")"
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.code === 409) {
        console.log(`  ⚠️  Collection already exists`);
        return true;
      }
      console.error(`  ❌ Error: ${data.message}`);
      return false;
    }

    console.log(`  ✅ Collection created successfully`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return false;
  }
}

async function setupCollections() {
  console.log("🚀 Creating KaamConnect Database Collections...\n");

  if (!API_KEY) {
    console.error("❌ API_KEY not set. Set it in the script or as environment variable.");
    process.exit(1);
  }

  const collections = [
    { id: "workers", name: "Workers" },
    { id: "jobs", name: "Jobs" },
    { id: "applications", name: "Applications" },
    { id: "reviews", name: "Reviews" },
    { id: "cities", name: "Cities" },
    { id: "categories", name: "Categories" }
  ];

  let created = 0;
  for (const collection of collections) {
    const success = await createCollection(collection.id, collection.name);
    if (success) created++;
  }

  console.log(`\n✅ Setup complete: ${created}/${collections.length} collections`);
}

// Run setup
setupCollections().catch(console.error);
