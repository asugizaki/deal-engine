const applyAffiliate = require("./affiliateEngine");
const fs = require("fs");
const fetchDeals = require("./fetchDeals");
const sendMessage = require("./sendMessage");

// Load cache
const cachePath = "./data/cache.json";
const cache = JSON.parse(fs.readFileSync(cachePath));

// Env
const token = process.env.TELEGRAM_BOT_TOKEN;

// Multi-channel setup (future-ready)
const channels = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS,
  general: process.env.TELEGRAM_GENERAL
};

console.log("🚀 Deal pipeline starting...");
console.log("🌐 Channels:", channels);
console.log("📦 Loaded cache:", cache.posted_ids.length, "items");

// -----------------------------
// FORMAT DEAL MESSAGE
// -----------------------------
function formatDeal(deal) {
  const qualityTag =
    deal.score >= 6
      ? "🔥 HIGH QUALITY"
      : deal.score >= 4
      ? "⚡ GOOD DEAL"
      : "🟡 NEW";

  return `
${qualityTag}

🔥 *${deal.name}*

${deal.description || "AI tool"}

💰 Price: ${deal.price || "N/A"}

👉 👉 [Get Deal](${deal.url})
`;
}

// -----------------------------
// CHANNEL ROUTING LOGIC
// -----------------------------
function getChannels(deal) {
  const targets = [];

  if (deal.category?.startsWith("ai") && channels.ai) {
    targets.push(channels.ai);
  }

  if (deal.category?.startsWith("saas") && channels.saas) {
    targets.push(channels.saas);
  }

  if (channels.general) {
    targets.push(channels.general);
  }

  return targets;
}

// -----------------------------
// MAIN PIPELINE
// -----------------------------
async function run() {
  try {
    let deals = await fetchDeals();

    console.log(`📡 Raw deals fetched: ${deals.length}`);

    // -----------------------------
    // FILTERING LAYER
    // -----------------------------
    deals = deals
      .filter((d) => d && d.name)
      .filter((d) => d.score >= 3)
      .filter((d) => !cache.posted_ids.includes(d.id));

    console.log(`🔥 After filtering: ${deals.length}`);

    // Sort by quality (best first)
    deals.sort((a, b) => b.score - a.score);

    // -----------------------------
    // PROCESS EACH DEAL
    // -----------------------------
    for (let deal of deals) {
      deal = applyAffiliate(deal);
    
      console.log("🏷️ Detected brand:", deal.brand);
      console.log("🔗 Affiliate URL:", deal.url);
    
      console.log("🔗 Affiliate URL:", deal.url);
      console.log("\n==============================");
      console.log(`🔍 Processing: ${deal.name}`);
      console.log(`🆔 ID: ${deal.id}`);
      console.log(`⭐ Score: ${deal.score}`);

      const message = formatDeal(deal);
      const targetChannels = getChannels(deal);

      console.log("📤 Channels:", targetChannels);

      if (!targetChannels.length) {
        console.log("⚠️ No channels matched — skipping");
        continue;
      }

      for (const channel of targetChannels) {
        try {
          console.log(`➡️ Sending to ${channel}...`);

          const res = await sendMessage(token, channel, message);

          console.log("📩 Telegram status:", res.status);
          console.log("📩 Response:", res.body);
        } catch (err) {
          console.error("❌ Send failed:", err.message);
        }
      }

      // Mark as posted
      cache.posted_ids.push(deal.id);
      console.log(`💾 Cached: ${deal.id}`);
    }

    // -----------------------------
    // SAVE CACHE
    // -----------------------------
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));

    console.log("\n✅ Pipeline complete");
    console.log(`💾 Cache saved (${cache.posted_ids.length} items)`);
  } catch (err) {
    console.error("❌ Pipeline error:", err);
  }
}

// Run
run();
