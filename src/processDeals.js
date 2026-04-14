import { sendMessage } from "./sendMessage.js";
import { formatMessage } from "./formatMessage.js";
import { cleanText } from "./cleanText.js";
import fs from "fs";

const CACHE_FILE = "./cache.json";

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return new Set();
  return new Set(JSON.parse(fs.readFileSync(CACHE_FILE)));
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify([...cache], null, 2));
}

function isValidDeal(deal) {
  return deal?.name && deal?.url;
}

function scoreDeal(deal) {
  let score = 0;

  if (deal.name?.length > 3) score += 2;
  if (deal.tagline?.length > 10) score += 2;
  if (deal.affiliateLink) score += 4;
  if (deal.trending) score += 2;

  return score;
}

// fake fetch placeholder (replace with your ProductHunt / affiliate sync later)
async function fetchDeals() {
  return [
    {
      name: "AI Resume Builder",
      tagline: "Create job-winning resumes in seconds",
      url: "https://example.com/resume",
      affiliateLink: "https://example.com/resume?ref=pochify",
      trending: true,
      aiInsight: "High conversion potential for job seekers."
    },
    {
      name: "Notion AI Helper",
      tagline: "Automate writing inside Notion",
      url: "https://example.com/notion",
      affiliateLink: null,
      trending: true,
      aiInsight: "Strong SaaS adoption and recurring usage."
    }
  ];
}

export async function run() {
  console.log("🚀 Deal Engine Starting...");

  const cache = loadCache();
  const deals = await fetchDeals();

  console.log(`📦 Fetched deals: ${deals.length}`);

  for (const raw of deals) {
    const deal = {
      ...raw,
      name: cleanText(raw.name),
      tagline: cleanText(raw.tagline)
    };

    if (!isValidDeal(deal)) continue;
    if (cache.has(deal.url)) continue;

    const score = scoreDeal(deal);

    console.log(`🔍 Processing: ${deal.name}`);
    console.log(`⭐ Score: ${score}`);

    // filter low quality
    if (score < 3) continue;

    const message = formatMessage(deal);

    try {
      await sendMessage(process.env.TELEGRAM_AI, message);

      cache.add(deal.url);
      saveCache(cache);

      console.log(`✅ Sent: ${deal.name}`);
    } catch (err) {
      console.error(`❌ Failed: ${deal.name}`, err.message);
    }
  }

  console.log("🏁 Done");
}

run();
