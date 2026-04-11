const KNOWN_BRANDS = [
  "notion",
  "figma",
  "openai",
  "midjourney",
  "zapier",
  "canva",
  "hubspot",
  "grammarly"
];

const HIGH_VALUE_KEYWORDS = [
  "ai",
  "gpt",
  "automation",
  "copilot",
  "assistant",
  "generate",
  "llm",
  "workflow",
  "productivity"
];

// -----------------------------
// Extract price value (rough)
// -----------------------------
function extractPrice(deal) {
  const text = (deal.price || "").toLowerCase();

  const match = text.match(/(\d+(\.\d+)?)/);
  if (!match) return 10;

  return parseFloat(match[1]);
}

// -----------------------------
// Brand recognition score
// -----------------------------
function brandScore(text) {
  const lower = text.toLowerCase();

  for (const brand of KNOWN_BRANDS) {
    if (lower.includes(brand)) return 8;
  }

  return 3;
}

// -----------------------------
// AI relevance score
// -----------------------------
function keywordScore(text) {
  const lower = text.toLowerCase();
  let score = 0;

  for (const kw of HIGH_VALUE_KEYWORDS) {
    if (lower.includes(kw)) score += 2;
  }

  return Math.min(score, 10);
}

// -----------------------------
// Monetization potential score
// -----------------------------
function monetizationScore(price) {
  if (price >= 50) return 10;
  if (price >= 20) return 7;
  if (price >= 10) return 5;
  return 2;
}

// -----------------------------
// FINAL COMPOSITE SCORE
// -----------------------------
function scoreDeal(deal) {
  const text = `${deal.name} ${deal.description}`;

  const kScore = keywordScore(text);
  const bScore = brandScore(text);
  const price = extractPrice(deal);
  const mScore = monetizationScore(price);

  const finalScore = Math.round(
    kScore * 0.5 +
    bScore * 0.3 +
    mScore * 0.2
  );

  return {
    ...deal,
    priceValue: price,
    keywordScore: kScore,
    brandScore: bScore,
    monetizationScore: mScore,
    score: finalScore
  };
}

module.exports = scoreDeal;
