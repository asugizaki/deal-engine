// src/aiScorer.js

function scoreDeal(deal) {
  let score = 0;

  const name = (deal.name || "").toLowerCase();
  const description = (deal.description || "").toLowerCase();

  // -----------------------------
  // 1. MONETIZATION (0–5 points)
  // -----------------------------
  let monetizationScore = 0;

  if (deal.hasAffiliate) monetizationScore += 3;

  const highPayingTools = [
    "notion",
    "jasper",
    "copy.ai",
    "writesonic",
    "canva",
    "grammarly",
    "hubspot",
    "shopify",
    "clickfunnels"
  ];

  if (highPayingTools.some(b => name.includes(b))) {
    monetizationScore += 2;
  }

  // -----------------------------
  // 2. BUYER INTENT (0–3 points)
  // -----------------------------
  let intentScore = 0;

  const intentKeywords = [
    "deal",
    "discount",
    "offer",
    "lifetime",
    "pricing",
    "free trial",
    "sale",
    "coupon"
  ];

  if (intentKeywords.some(k => name.includes(k) || description.includes(k))) {
    intentScore += 3;
  }

  // -----------------------------
  // 3. TREND / NICHE (0–1.5 points)
  // -----------------------------
  let trendScore = 0;

  const trendingKeywords = [
    "ai",
    "automation",
    "chatgpt",
    "llm",
    "agent",
    "workflow"
  ];

  if (trendingKeywords.some(k => name.includes(k) || description.includes(k))) {
    trendScore += 1.5;
  }

  // -----------------------------
  // 4. BRAND TRUST (0–1.5 points)
  // -----------------------------
  let brandScore = 0;

  const knownBrands = [
    "notion",
    "openai",
    "anthropic",
    "midjourney",
    "zapier"
  ];

  if (knownBrands.some(b => name.includes(b))) {
    brandScore += 1.5;
  }

  // -----------------------------
  // TOTAL SCORE
  // -----------------------------
  score = monetizationScore + intentScore + trendScore + brandScore;

  // Normalize to 10
  if (score > 10) score = 10;

  return {
    ...deal,
    score: Math.round(score),
    breakdown: {
      monetizationScore,
      intentScore,
      trendScore,
      brandScore
    }
  };
}

module.exports = { scoreDeal };
