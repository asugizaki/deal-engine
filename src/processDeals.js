import fs from "fs";

// =========================
// CONFIG
// =========================

const BACKEND_URL = "https://go.pochify.com/api/deals";

// =========================
// Helpers
// =========================

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// =========================
// MOCK DEALS (replace with your real pipeline)
// =========================

function getDeals() {
  return [
    {
      name: "Notion AI",
      description: "AI writing assistant inside Notion",
      url: "https://notion.so",
    },
    {
      name: "Jasper AI",
      description: "AI content generation platform",
      url: "https://jasper.ai",
    }
  ];
}

// =========================
// MAIN
// =========================

async function run() {
  console.log("🚀 Processing deals...");

  const rawDeals = getDeals();

  const deals = rawDeals.map(d => ({
    ...d,
    slug: slugify(d.name),
    affiliateLink: null,
    clicks: 0
  }));

  console.log(`📦 Built ${deals.length} deals`);

  // Send to Railway
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(deals)
  });

  const data = await res.json();

  console.log("📡 Backend response:", data);

  console.log("🏁 Done");
}

run();
