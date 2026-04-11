const fs = require("fs");
const sendMessage = require("./sendMessage");

// Load data
const deals = JSON.parse(fs.readFileSync("./data/deals.json"));
const cache = JSON.parse(fs.readFileSync("./data/cache.json"));

// Env
const token = process.env.TELEGRAM_BOT_TOKEN;

// Multi-channel config (future-proof)
const channels = {
  ai: process.env.TELEGRAM_AI,
  saas: process.env.TELEGRAM_SAAS,
  general: process.env.TELEGRAM_GENERAL
};

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
  if (deal.category.startsWith("ai") && channels.ai) {
    targets.push(channels.ai);
  }

  // Future:
  if (deal.category.startsWith("saas") && channels.saas) {
    targets.push(channels.saas);
  }

  // Optional general channel (disabled unless set)
  if (channels.general) {
    targets.push(channels.general);
  }

  return targets;
}

async function run() {
  for (const deal of deals) {
    // Skip already posted
    if (cache.posted_ids.includes(deal.id)) continue;

    const message = formatDeal(deal);
    const targetChannels = getChannelsForDeal(deal);

    for (const channel of targetChannels) {
      try {
        await sendMessage(token, channel, message);
        console.log(`Posted to ${channel}: ${deal.name}`);
      } catch (err) {
        console.error(`Failed posting ${deal.name}:`, err);
      }
    }

    cache.posted_ids.push(deal.id);
  }

  // Save cache
  fs.writeFileSync("./data/cache.json", JSON.stringify(cache, null, 2));
}

run();
