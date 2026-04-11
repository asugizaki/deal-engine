const fs = require("fs");
const sendMessage = require("./sendMessage");

// Load data
const fetchDeals = require("./fetchDeals");
const cache = JSON.parse(fs.readFileSync("./data/cache.json"));

// Env
const token = process.env.TELEGRAM_BOT_TOKEN;

// Multi-channel config (future-proof)
const channels = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS
};

// 🔍 Startup logs
console.log("🚀 Starting deal pipeline...");
console.log(`📦 Loaded ${deals.length} deals`);
console.log("🧠 Cache state:", JSON.stringify(cache, null, 2));
console.log("🌐 Channels config:", channels);

// Format message
function formatDeal(deal) {
  return `
🔥 *${deal.name}* — ${deal.discount}

${deal.description}

💰 Now: ${deal.price}
~~${deal.original_price}~~

👉 ${deal.url}
`;
}

// Determine which channels to post to
function getChannelsForDeal(deal) {
  const targets = [];

  // AI deals → AI channel
  if (deal.category && deal.category.startsWith("ai") && channels.ai) {
    targets.push(channels.ai);
  }

  // Future expansion
  if (deal.category && deal.category.startsWith("saas") && channels.saas) {
    targets.push(channels.saas);
  }

  return targets;
}

async function run() {
  const deals = await fetchDeals();

  for (const deal of deals)
    console.log("\n==============================");
    console.log(`🔍 Processing deal: ${deal.name}`);
    console.log(`🆔 Deal ID: ${deal.id}`);

    // Skip already posted
    if (cache.posted_ids.includes(deal.id)) {
      console.log("⏭️ Skipping (already posted)");
      continue;
    }

    const message = formatDeal(deal);
    const targetChannels = getChannelsForDeal(deal);

    console.log("📤 Target channels:", targetChannels);
    console.log("📝 Message preview:\n", message);

    if (targetChannels.length === 0) {
      console.log("⚠️ No channels matched — skipping");
      continue;
    }

    for (const channel of targetChannels) {
      try {
        const res = await sendMessage(token, channel, message);
        console.log(`📩 Response status: ${res.status}`);
        console.log(`📩 Response body: ${res.body}`);
        console.log(`✅ Posted to ${channel}`);
      } catch (err) {
        console.error(`❌ Failed posting to ${channel}:`, err);
      }
    }

    // Add to cache AFTER posting
    cache.posted_ids.push(deal.id);
    console.log(`💾 Cached deal: ${deal.id}`);
  }

  // Save cache
  fs.writeFileSync("./data/cache.json", JSON.stringify(cache, null, 2));
  console.log("\n💾 Cache updated successfully");
}

run();
