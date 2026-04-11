const https = require("https");

// Simple RSS fetch helper
function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

// Product Hunt AI RSS feed
const PRODUCT_HUNT_AI_RSS =
  "https://www.producthunt.com/feed?category=AI";

async function fetchDeals() {
  console.log("🌐 Fetching AI deals from sources...");

  const rss = await fetchRSS(PRODUCT_HUNT_AI_RSS);

  console.log("📡 Raw RSS fetched (Product Hunt)");

  // NOTE: We keep it simple for MVP
  // Later we parse XML properly
  return [
    {
      id: "ph-sample-001",
      name: "AI Tool from Product Hunt",
      description: "New AI tool discovered via Product Hunt",
      price: "Varies",
      original_price: "",
      discount: "NEW",
      url: "https://producthunt.com",
      category: "ai"
    }
  ];
}

module.exports = fetchDeals;
