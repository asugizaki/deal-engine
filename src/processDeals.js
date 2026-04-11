const fs = require("fs");

const fetchDeals = require("./fetchDeals");
const sendMessage = require("./sendMessage");
const scoreDeal = require("./aiScorer");
const applyAffiliate = require("./affiliateEngine");

// -----------------------------
// LOAD CACHE
// -----------------------------
const cachePath = "./data/cache.json";
const cache = JSON.parse(fs.readFileSync(cachePath));

// -----------------------------
// ENV
// -----------------------------
const token = process.env.TELEGRAM_BOT_TOKEN;

// ONLY ACTIVE CHANNELS (AI + SAAS)
const channels = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS
};

console.log("🚀 Starting AI Deal Engine...");
console.log("📡 Channels:", channels);
console.log("💾 Cached items:", cache.posted_ids.length);

// -----------------------------
// FORMAT MESSAGE
// -----------------------------
function formatDeal(deal) {
  const label =
    deal.score >= 8
      ? "🔥 TOP AI PICK"
      : deal.score >= 6
      ? "⚡ HIGH QUALITY"
      : "🟡 TRENDING";

  return `
${label}

🔥 *${deal.name}*

${deal.description || "AI tool"}

💰 Price: ${deal.price || "N/A"}

📊 Score: ${deal.score}/10

👉 [Get Deal](${deal.url})
`;
}

// -----------------------------
// CHANNEL ROUTING
// -----------------------------
function getChannels(deal) {
  const targets = [];

  if (deal.category?.startsWith("ai") && channels.ai) {
    targets.push(channels.ai);
  }

  if (deal.category?.startsWith("saas") && channels.saas) {
    targets.push(channels.saas);
  }

  return targets;
}

// -----------------------------
// MAIN PIPELINE
// -----------------------------
async function run() {
  try {
    console.log("\n🌐 Fetching deals...");
    let deals = await fetchDeals();

    console.log(`📦 Raw deals: ${deals.length}`);

    // -----------------------------
    // AI SCORING + AFFILIATE LAYER
    // -----------------------------
    deals = deals
      .map(scoreDeal)
      .map(applyAffiliate);

    console.log("🧠 Scoring + affiliate enrichment complete");

    console.log("\n🧠 SAMPLE SCORED DEALS (DEBUG):");
    
    console.log(
      deals.slice(0, 5).map(d => ({
        name: d.name,
        score: d.score,
        brandScore: d.brandScore,
        keywordScore: d.keywordScore,
        monetizationScore: d.monetizationScore
      }))
    );

    // -----------------------------
    // FILTERING
    // -----------------------------
    deals = deals
      .filter((d) => d && d.name)
      .filter((d) => d.score >= 2)
      .filter((d) => !cache.posted_ids.includes(d.id));

    console.log(`🔥 After filtering: ${deals.length}`);

    // Sort by best potential first
    deals.sort((a, b) => b.score - a.score);

    // -----------------------------
    // PROCESS EACH DEAL
    // -----------------------------
    for (const deal of deals) {
      console.log("\n==============================");
      console.log(`🔍 Deal: ${deal.name}`);
      console.log(`🏷️ Brand: ${deal.brand || "unknown"}`);
      console.log(`⭐ Score: ${deal.score}`);

      const message = formatDeal(deal);
      const targetChannels = getChannels(deal);

      console.log("📤 Channels:", targetChannels);

      if (!targetChannels.length) {
        console.log("⚠️ No matching channels — skipping");
        continue;
      }

      for (const channel of targetChannels) {
        try {
          console.log(`➡️ Sending to ${channel}...`);

          const res = await sendMessage(token, channel, message);

          console.log("📩 Status:", res.status);
          console.log("📩 Response:", res.body);
        } catch (err) {
          console.error("❌ Send failed:", err.message);
        }
      }

      // -----------------------------
      // UPDATE CACHE
      // -----------------------------
      cache.posted_ids.push(deal.id);
      console.log(`💾 Cached: ${deal.id}`);
    }

    // Save cache
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));

    console.log("\n✅ Pipeline complete");
    console.log(`💾 Total cached: ${cache.posted_ids.length}`);
  } catch (err) {
    console.error("❌ Pipeline error:", err);
  }
}

// RUN
run();
