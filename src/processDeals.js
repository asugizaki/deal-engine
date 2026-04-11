const fs = require("fs");

const fetchDeals = require("./fetchDeals");
const sendMessage = require("./sendMessage");
const scoreDeal = require("./aiScorer");
const resolveAffiliate = require("./affiliateNetworkResolver");

// -----------------------------
// LOAD CACHE
// -----------------------------
const cachePath = "./data/cache.json";
const cache = JSON.parse(fs.readFileSync(cachePath));

// -----------------------------
// ENV
// -----------------------------
const token = process.env.TELEGRAM_BOT_TOKEN;

// ONLY ACTIVE CHANNELS
const channels = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS
};

console.log("🚀 AI Deal Engine Starting...");
console.log("📡 Channels:", channels);
console.log("💾 Cached deals:", cache.posted_ids.length);

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// -----------------------------
// FORMAT MESSAGE
// -----------------------------
function formatDeal(deal) {
  const tag =
    deal.score >= 8
      ? "🔥 TOP PICK"
      : deal.score >= 6
      ? "⚡ HIGH QUALITY"
      : "🟡 TRENDING";

  const affiliateInfo = deal.affiliateNetwork
    ? `💰 Affiliate: ${deal.affiliateNetwork}`
    : "🔎 No affiliate program found";

  return `
  🔥 ${tag}
  
  🔥 <b>${escapeHtml(deal.name)}</b>
  
  ${deal.description || "AI tool"}
  
  📊 Score: ${deal.score}/10
  
  💰 Affiliate: ${deal.affiliateNetwork || "none"}
  
  💰 Price: ${deal.price || "N/A"}
  
  👉 ${deal.monetizedUrl || deal.url}
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

    console.log(`📦 Raw deals fetched: ${deals.length}`);

    // -----------------------------
    // AI SCORING + AFFILIATE RESOLUTION
    // -----------------------------
    deals = deals
      .map(scoreDeal)
      .map(resolveAffiliate);

    console.log("🧠 Scoring + affiliate resolution complete");

    // -----------------------------
    // DEBUG SAMPLE (IMPORTANT)
    // -----------------------------
    console.log("\n🧠 SAMPLE SCORED DEALS:");
    console.log(
      deals.slice(0, 5).map((d) => ({
        name: d.name,
        score: d.score,
        brandScore: d.brandScore,
        keywordScore: d.keywordScore,
        monetizationScore: d.monetizationScore,
        affiliateNetwork: d.affiliateNetwork || null,
        hasAffiliate: !!d.monetizedUrl
      }))
    );

    // -----------------------------
    // FILTERING (REAL-WORLD SAFE)
    // -----------------------------
    deals = deals
      .filter((d) => d && d.name)
      .filter((d) => d.score >= 1);
      // comment out for now .filter((d) => !cache.posted_ids.includes(d.id));

    console.log(`🔥 After filtering: ${deals.length}`);

    // Sort best first
    deals.sort((a, b) => b.score - a.score);

    // -----------------------------
    // PROCESS EACH DEAL
    // -----------------------------
    for (const deal of deals) {
      console.log("\n==============================");
      console.log(`🔍 Processing: ${deal.name}`);
      console.log(`⭐ Score: ${deal.score}`);
      console.log(`🏷️ Affiliate: ${deal.affiliateNetwork || "none"}`);

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
          console.error("❌ Telegram send error:", err.message);
        }
      }

      // -----------------------------
      // CACHE UPDATE
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
