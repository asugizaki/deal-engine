const Parser = require("rss-parser");
const parser = new Parser();

// Real sources
const SOURCES = [
  {
    name: "producthunt-ai",
    url: "https://www.producthunt.com/feed?category=AI"
  }
];

// Simple keyword scoring system
const AI_KEYWORDS = [
  "ai",
  "gpt",
  "automation",
  "copilot",
  "assistant",
  "generate",
  "chat",
  "model",
  "llm",
  "image",
  "text"
];

function scoreDeal(text) {
  const lower = text.toLowerCase();
  let score = 0;

  AI_KEYWORDS.forEach((kw) => {
    if (lower.includes(kw)) score += 2;
  });

  return score;
}

async function fetchDeals() {
  console.log("🌐 Fetching real AI deals...");

  let allDeals = [];

  for (const source of SOURCES) {
    try {
      console.log(`📡 Fetching: ${source.name}`);

      const feed = await parser.parseURL(source.url);

      const deals = feed.items.map((item) => {
        const title = item.title || "";
        const link = item.link || "";
        const desc = item.contentSnippet || "";

        const rawText = `${title} ${desc}`;
        const score = scoreDeal(rawText);

        return {
          id: item.guid || link,
          name: title,
          description: desc.slice(0, 200),
          url: link,
          category: "ai",
          score
        };
      });

      allDeals = allDeals.concat(deals);
    } catch (err) {
      console.error(`❌ Failed source ${source.name}:`, err.message);
    }
  }

  console.log(`📦 Raw deals fetched: ${allDeals.length}`);

  return allDeals;
}

module.exports = fetchDeals;
