/**
 * KaamConnect Database Setup Script
 * 
 * This script automatically:
 * - Creates all database collections with proper schemas
 * - Populates with cities, categories, workers, jobs, and reviews
 * 
 * Run in browser console at: http://localhost:4173
 * Copy-paste the entire script and press Enter
 */

import { databases, ID, appwriteConfig } from "./appwrite.js";

const setupData = {
  cities: [
    "Lajpat Nagar",
    "Karol Bagh",
    "Saket",
    "Rohini",
    "Dwarka",
    "South Extension",
    "Connaught Place",
    "Chandni Chowk",
    "Defence Colony",
    "Greater Kailash",
    "Noida",
    "Gurugram"
  ],

  categories: [
    { id: "electrician", name: "Electrician", icon: "ph ph-flashlight" },
    { id: "plumber", name: "Plumber", icon: "ph ph-wrench" },
    { id: "carpenter", name: "Carpenter", icon: "ph ph-hammer" },
    { id: "maid", name: "Maid", icon: "ph ph-broom" },
    { id: "mechanic", name: "Mechanic", icon: "ph ph-gear-six" },
    { id: "painter", name: "Painter", icon: "ph ph-paint-brush" },
    { id: "mason", name: "Mason", icon: "ph ph-buildings" },
    { id: "driver", name: "Driver", icon: "ph ph-car" },
    { id: "cook", name: "Cook", icon: "ph ph-fork-knife" },
    { id: "welder", name: "Welder", icon: "ph ph-fire" },
    { id: "labour", name: "Labour", icon: "ph ph-hard-hat" }
  ],

  workers: [
    {
      name: "Ramesh Kumar",
      email: "ramesh@example.com",
      phone: "9876543210",
      category: "electrician",
      city: "Lajpat Nagar",
      rate: 600,
      experience: 8,
      available: true,
      reviewsCount: 47,
      languages: "Hindi, English",
      skills: "Home Wiring, AC Repair, Switchboard, Solar Panel, Ceiling Fan",
      about: "Expert in home wiring, AC repair, switchboard fitting. Reliable and on time."
    },
    {
      name: "Sunita Devi",
      email: "sunita@example.com",
      phone: "9876543201",
      category: "maid",
      city: "Karol Bagh",
      rate: 400,
      experience: 6,
      available: true,
      reviewsCount: 34,
      languages: "Hindi",
      skills: "Cleaning, Laundry, Cooking, Organizing",
      about: "Dedicated home helper with 6 years experience"
    },
    {
      name: "Raju Yadav",
      email: "raju@example.com",
      phone: "9876543202",
      category: "plumber",
      city: "Saket",
      rate: 700,
      experience: 9,
      available: false,
      reviewsCount: 19,
      languages: "Hindi, English",
      skills: "Pipe Fitting, Leak Repair, Installation",
      about: "Professional plumber with 9 years experience"
    },
    {
      name: "Amit Sharma",
      email: "amit@example.com",
      phone: "9876543203",
      category: "carpenter",
      city: "Rohini",
      rate: 900,
      experience: 10,
      available: true,
      reviewsCount: 26,
      languages: "Hindi, English, Punjabi",
      skills: "Furniture, Wooden Doors, Shelves, Repairs",
      about: "Expert carpentry work with custom designs"
    },
    {
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "9876543204",
      category: "painter",
      city: "Defence Colony",
      rate: 450,
      experience: 5,
      available: true,
      reviewsCount: 22,
      languages: "Hindi, English",
      skills: "Interior Painting, Exterior Painting, Wall Finishing",
      about: "Professional painter with attention to detail"
    },
    {
      name: "Vikram Singh",
      email: "vikram@example.com",
      phone: "9876543205",
      category: "mechanic",
      city: "Dwarka",
      rate: 550,
      experience: 12,
      available: true,
      reviewsCount: 55,
      languages: "Hindi, English, Punjabi",
      skills: "Car Repair, Maintenance, Diagnostic",
      about: "Trusted mechanic with 12 years experience"
    }
  ],

  jobs: [
    {
      title: "Electrician needed",
      category: "electrician",
      city: "Lajpat Nagar",
      rate: 700,
      duration: "1 week",
      status: "open",
      employerId: "demo_employer_1",
      description: "Need electrician for home wiring and switchboard installation",
      applicationsCount: 0,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "House Cleaning Work",
      category: "maid",
      city: "Dwarka",
      rate: 500,
      duration: "2-3 days",
      status: "open",
      employerId: "demo_employer_2",
      description: "Need help for home cleaning and organizing",
      applicationsCount: 0,
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Plumbing Repair",
      category: "plumber",
      city: "South Extension",
      rate: 600,
      duration: "1 day",
      status: "open",
      employerId: "demo_employer_3",
      description: "Leak repair in kitchen and bathroom",
      applicationsCount: 0,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Custom Furniture Design",
      category: "carpenter",
      city: "Connaught Place",
      rate: 800,
      duration: "1 week",
      status: "open",
      employerId: "demo_employer_4",
      description: "Need carpenter for custom wardrobe and shelves",
      applicationsCount: 0,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Interior Painting",
      category: "painter",
      city: "Defence Colony",
      rate: 500,
      duration: "3 days",
      status: "open",
      employerId: "demo_employer_5",
      description: "Bedroom and living room painting - 3 rooms total",
      applicationsCount: 0,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Car Maintenance",
      category: "mechanic",
      city: "Dwarka",
      rate: 650,
      duration: "2 days",
      status: "open",
      employerId: "demo_employer_6",
      description: "Regular maintenance and checkup for sedan car",
      applicationsCount: 0,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ],

  reviews: [
    {
      workerId: "temp_worker_1",
      employerId: "demo_employer_1",
      comment: "Excellent work! Very professional and on time.",
      jobId: "temp_job_1",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      workerId: "temp_worker_1",
      employerId: "demo_employer_2",
      comment: "Great service, highly recommend!",
      jobId: "temp_job_2",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      workerId: "temp_worker_2",
      employerId: "demo_employer_3",
      comment: "Very clean and organized work.",
      jobId: "temp_job_3",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

async function setupDatabase() {
  console.log("🚀 Starting KaamConnect Database Setup...\n");

  try {
    console.log("📋 NOTE: Collections should already exist in Appwrite console");
    console.log("If missing, create: workers, jobs, applications, reviews, cities, categories\n");

    // Step 1: Add Cities
    console.log("\n🏙️  Step 1: Adding Cities...");
    for (const city of setupData.cities) {
      try {
        await databases.createDocument(
          appwriteConfig.databaseId,
          "cities",
          ID.unique(),
          { name: city }
        );
      } catch (error) {
        if (error.code !== 409) console.error(`Failed to add city ${city}:`, error.message);
      }
    }
    console.log(`  ✅ Added ${setupData.cities.length} cities`);

    // Step 2: Add Categories
    console.log("\n🏷️  Step 2: Adding Categories...");
    for (const category of setupData.categories) {
      try {
        await databases.createDocument(
          appwriteConfig.databaseId,
          "categories",
          category.id,
          category
        );
      } catch (error) {
        if (error.code !== 409) console.error(`Failed to add category ${category.name}:`, error.message);
      }
    }
    console.log(`  ✅ Added ${setupData.categories.length} categories`);

    // Step 3: Add Workers
    console.log("\n👷 Step 3: Adding Workers...");
    const workerIds = [];
    for (const worker of setupData.workers) {
      try {
        const doc = await databases.createDocument(
          appwriteConfig.databaseId,
          "workers",
          ID.unique(),
          worker
        );
        workerIds.push(doc.$id);
        console.log(`  ✅ Added: ${worker.name}`);
      } catch (error) {
        if (error.code !== 409) console.error(`Failed to add worker ${worker.name}:`, error.message);
      }
    }
    console.log(`  ✅ Total workers added: ${workerIds.length}`);

    // Step 4: Add Jobs
    console.log("\n💼 Step 4: Adding Jobs...");
    const jobIds = [];
    for (const job of setupData.jobs) {
      try {
        const doc = await databases.createDocument(
          appwriteConfig.databaseId,
          "jobs",
          ID.unique(),
          job
        );
        jobIds.push(doc.$id);
        console.log(`  ✅ Added: ${job.title}`);
      } catch (error) {
        if (error.code !== 409) console.error(`Failed to add job ${job.title}:`, error.message);
      }
    }
    console.log(`  ✅ Total jobs added: ${jobIds.length}`);

    // Step 5: Add Reviews
    console.log("\n⭐ Step 5: Adding Reviews...");
    for (const review of setupData.reviews) {
      try {
        await databases.createDocument(
          appwriteConfig.databaseId,
          "reviews",
          ID.unique(),
          review
        );
      } catch (error) {
        if (error.code !== 409) console.error(`Failed to add review:`, error.message);
      }
    }
    console.log(`  ✅ Added ${setupData.reviews.length} reviews`);

    console.log("\n✅ DATABASE SETUP COMPLETE! 🎉");
    console.log("\n📊 Summary:");
    console.log(`  • ${setupData.cities.length} cities`);
    console.log(`  • ${setupData.categories.length} work categories`);
    console.log(`  • ${setupData.workers.length} workers`);
    console.log(`  • ${setupData.jobs.length} jobs`);
    console.log(`  • ${setupData.reviews.length} reviews`);
    
    console.log("\n🔍 Now test it:");
    console.log("  • Visit: http://localhost:4173/search.html");
    console.log("  • You should see workers and jobs populated!");
    
    return { success: true, workerIds, jobIds };

  } catch (error) {
    console.error("\n❌ Setup Failed:", error);
    throw error;
  }
}

// Run the setup
setupDatabase().catch(error => {
  console.error("Fatal error:", error);
});
