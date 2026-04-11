const sendMessage = require("./sendMessage");
const scoreDeal = require("./aiScorer");

// ----------------------
// CONFIG
// ----------------------
const CHANNELS = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS
};

const MIN_SCORE = 2;

// ----------------------
// CLEAN TEXT (INLINE)
// ----------------------
function cleanText(text = "") {
  return String(text)
    // remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")

    // normalize non-breaking spaces
    .replace(/\u00A0/g, " ")

    // remove weird indentation before line breaks
    .replace(/[ \t]+\n/g, "\n")

    // collapse multiple line breaks
    .replace(/\n{3,}/g, "\n\n")

    // remove control characters
    .replace(/[\x00-\x1F\x7F]/g, "")

    .trim();
}

// ----------------------
// SLEEP UTILITY (CRITICAL FOR TELEGRAM)
// ----------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ----------------------
// SAFE TELEGRAM SENDER WITH RETRY
// ----------------------
async function sendWithRetry(chatId, message, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await sendMessage(chatId, message);

      if (res?.status === 200 || res?.ok) {
        return res;
      }

      throw new Error(`Telegram failed: ${res?.status}`);
    } catch (err) {
      console.log(`⚠️ Send attempt ${i + 1} failed`);

      if (i === retries) return null;

      await sleep(800 + Math.random() * 500);
    }
  }
}

// ----------------------
// FORMAT MESSAGE (HTML SAFE)
// ----------------------
function formatDeal(deal) {
  const name = cleanText(deal.name);
  const desc = cleanText(deal.description || "");

  return `
🔥 🟡 TRENDING

🔥 <b>${name}</b>

${desc ? desc.slice(0, 120) : "AI / SaaS tool"}

📊 Score: ${deal.score}/10

💰 Affiliate: ${deal.affiliateNetwork || "none"}

💰 Price: ${deal.price || "N/A"}

👉 ${deal.url}
`;
}

// ----------------------
// MAIN PIPELINE
// ----------------------
async function processDeals(deals = []) {
  console.log("🚀 Starting Deal Engine...");
  console.log("📡 Channels:", {
    ai: CHANNELS.ai ? "***" : "MISSING",
    saas: CHANNELS.saas ? "***" : "MISSING"
  });

  let sent = 0;
  let failed = 0;

  for (const rawDeal of deals) {
    try {
      // ----------------------
      // SCORE DEAL
      // ----------------------
      const deal = scoreDeal(rawDeal);

      console.log("\n==============================");
      console.log("🔍 Processing:", deal.name);
      console.log("⭐ Score:", deal.score);

      if (deal.score < MIN_SCORE) {
        console.log("⛔ Skipped (low score)");
        continue;
      }

      // ----------------------
      // CHANNEL ROUTING
      // ----------------------
      const channels = [];

      if (deal.category === "ai" || deal.name?.toLowerCase().includes("ai")) {
        if (CHANNELS.ai) channels.push(CHANNELS.ai);
      } else {
        if (CHANNELS.saas) channels.push(CHANNELS.saas);
      }

      console.log("📤 Channels:", channels);

      if (!channels.length) {
        console.log("⚠️ No channels configured");
        continue;
      }

      // ----------------------
      // FORMAT MESSAGE
      // ----------------------
      const message = cleanText(formatDeal(deal));

      console.log("🧪 RAW LENGTH:", message.length);
      console.log("🧪 SAMPLE:", message.slice(0, 120));

      // ----------------------
      // SEND TO TELEGRAM
      // ----------------------
      for (const channel of channels) {
        console.log("➡️ Sending to:", channel);

        const result = await sendWithRetry(channel, message);

        if (result) {
          console.log("✅ Sent successfully");
          sent++;
        } else {
          console.log("❌ Failed to send");
          failed++;
        }

        // ----------------------
        // TELEGRAM RATE LIMIT SAFETY
        // ----------------------
        await sleep(800 + Math.random() * 400);
      }
    } catch (err) {
      console.log("❌ Deal processing error:", err.message);
      failed++;
    }
  }

  console.log("\n==============================");
  console.log("✅ PIPELINE COMPLETE");
  console.log("📤 Sent:", sent);
  console.log("❌ Failed:", failed);
}

module.exports = processDeals;
