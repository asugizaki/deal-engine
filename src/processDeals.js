import { syncAffiliatePrograms } from "./sync/affiliateSync.js";
import { findAffiliate } from "./affiliateResolver.js";
import { sendMessage } from "./sendMessage.js";

// ========================
// MOCK OR REAL DEAL SOURCE
// ========================
async function fetchDeals() {
  return [
    { name: "Notion AI", url: "https://notion.so", source: "producthunt" },
    { name: "Copy.ai", url: "https://copy.ai", source: "producthunt" },
    { name: "Canva AI", url: "https://canva.com", source: "producthunt" }
  ];
}

// ========================
// SCORING (simple fallback so pipeline works)
// ========================
function scoreDeal(deal) {
  let score = 5;

  if (deal.name.toLowerCase().includes("ai")) score += 3;
  if (deal.name.length < 10) score -= 1;

  return score;
}

// ========================
// FORMAT MESSAGE
// ========================
function formatDeal(deal, affiliate) {
  return `
🔥 TRENDING
🔥 <b>${deal.name}</b>

📊 Score: ${deal.score}/10

💰 Affiliate: ${affiliate?.affiliate?.name || "none"}

👉 ${affiliate?.affiliate?.trackingUrl || deal.url}
  `.trim();
}

// ========================
// MAIN PIPELINE
// ========================
async function run() {
  console.log("🚀 Affiliate-first Deal Engine Starting...");

  // 1. sync affiliate programs
  await syncAffiliatePrograms();

  // 2. fetch deals
  const deals = await fetchDeals();

  console.log(`📦 Deals fetched: ${deals.length}`);

  // 3. process each deal
  for (const deal of deals) {
    const affiliate = findAffiliate(deal.name);
    deal.score = scoreDeal(deal);

    const message = formatDeal(deal, affiliate);

    console.log("\n🔍 Processing:", deal.name);
    console.log("🧪 Message preview:", message.slice(0, 120));

    try {
      const success = await sendMessage(message);

      if (!success) {
        console.log("❌ Telegram send failed");
      } else {
        console.log("✅ Sent");
      }
    } catch (err) {
      console.log("❌ Error sending:", err.message);
    }
  }

  console.log("🏁 Pipeline complete");
}

// ========================
// EXECUTE
// ========================
run();
