const fs = require("fs");
const https = require("https");

const deals = JSON.parse(fs.readFileSync("./data/deals.json"));
const cache = JSON.parse(fs.readFileSync("./data/cache.json"));

const token = process.env.TELEGRAM_BOT_TOKEN;

// Multi-channel support
const channel = process.env.TELEGRAM_AI;

// Helper to send message
function sendMessage(chatId, message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    });

    const options = {
      hostname: "api.telegram.org",
      path: `/bot${token}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
      }
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode);
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// Format message
function formatDeal(deal) {
  return `
🔥 *${deal.title}*

💰 ${deal.price}

👉 ${deal.url}
`;
}

async function run() {
  for (const deal of deals) {
    // Skip if already posted
    if (cache.posted.includes(deal.id)) continue;

    const message = formatDeal(deal);

    // Always post to general
    if (channels.general) {
      await sendMessage(channels.general, message);
    }

    // Post to niche channel if exists
    if (channels[deal.category]) {
      await sendMessage(channels[deal.category], message);
    }

    console.log(`Posted: ${deal.title}`);

    cache.posted.push(deal.id);
  }

  // Save updated cache
  fs.writeFileSync("./data/cache.json", JSON.stringify(cache, null, 2));
}

run();
