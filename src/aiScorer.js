// src/aiScorer.js

function scoreDeal(deal) {
  let score = 0;

  const name = (deal.name || "").toLowerCase();
  const description = (deal.description || "").toLowerCase();

  // --- Brand score ---
  const strongBrands = [
    "notion",
    "jasper",
    "copy.ai",
    "writesonic",
    "canva",
    "grammarly"
  ];

  if (strongBrands.some(b => name.includes(b))) {
    score += 5;
  } else {
    score += 2;
  }

  // --- Keyword score ---
  const keywords = [
    "ai",
    "automation",
    "productivity",
    "marketing",
    "saas"
  ];

  if (keywords.some(k => name.includes(k) || description.includes(k))) {
    score += 2;
  }

  // --- Monetization boost ---
  if (deal.hasAffiliate) {
    score += 3;
  }

  // Clamp to 10
  if (score > 10) score = 10;

  return {
    ...deal,
    score
  };
}

module.exports = { scoreDeal };
