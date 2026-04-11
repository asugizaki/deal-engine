const HIGH_VALUE_KEYWORDS = [
  "ai",
  "gpt",
  "automation",
  "copilot",
  "assistant",
  "generate",
  "llm",
  "workflow",
  "productivity",
  "chat",
  "write",
  "builder",
  "agent"
];

// -----------------------------
// BRAND SCORING (soft signal)
// -----------------------------
const KNOWN_BRANDS = [
  "notion",
  "figma",
  "openai",
  "midjourney",
  "zapier",
  "canva",
  "hubspot",
  "grammarly",
  "slack"
];

function brandScore(text) {
  const lower = text.toLowerCase();

  for (const brand of KNOWN_BRANDS) {
    if (lower.includes(brand)) return 7;
  }

  return 3;
}

// -----------------------------
// KEYWORD SCORING (FIXED)
// -----------------------------
function keywordScore(text) {
  const lower = text.toLowerCase();
  let score = 0;

  for (const kw of HIGH_VALUE_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 1.5; // softened weight (IMPORTANT FIX)
    }
  }

  return Math.min(score, 10);
}

// -----------------------------
// STRUCTURE SCORING (NEW - VERY IMPORTANT)
// -----------------------------
function structureScore(text) {
  const lower = text.toLowerCase();
  let score = 0;

  // SaaS/product signals
  if (lower.includes("tool")) score += 1;
  if (lower.includes("platform")) score += 2;
  if (lower.includes("workflow")) score += 3;
  if (lower.includes("automation")) score += 3;
  if (lower.includes("dashboard")) score += 2;
  if (lower.includes("app")) score += 1;
  if (lower.includes("builder")) score += 2;
  if (lower.includes("assistant")) score += 2;

  return Math.min(score, 10);
}

// -----------------------------
// MONETIZATION POTENTIAL
// -----------------------------
function monetizationScore(text) {
  const lower = text.toLowerCase();

  let score = 4; // default baseline (IMPORTANT FIX)

  if (lower.includes("subscription")) score += 3;
  if (lower.includes("pro")) score += 2;
  if (lower.includes("team")) score += 2;
  if (lower.includes("business")) score += 2;
  if (lower.includes("enterprise")) score += 3;

  return Math.min(score, 10);
}

// -----------------------------
// FINAL SCORE ENGINE
// -----------------------------
function scoreDeal(deal) {
  const text = `${deal.name} ${deal.description || ""}`;

  const kScore = keywordScore(text);
  const bScore = brandScore(text);
  const sScore = structureScore(text);
  const mScore = monetizationScore(text);

  // Weighted scoring tuned for real-world RSS data
  const finalScore = Math.round(
    kScore * 0.3 +
    bScore * 0.25 +
    sScore * 0.3 +
    mScore * 0.15
  );

  return {
    ...deal,
    keywordScore: Number(kScore.toFixed(1)),
    brandScore: bScore,
    structureScore: sScore,
    monetizationScore: mScore,
    score: Math.max(1, Math.min(finalScore, 10)) // clamp 1–10
  };
}

module.exports = scoreDeal;
