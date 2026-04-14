const fs = require("fs");
const path = require("path");

// ========================
// CONFIG
// ========================
const AFFILIATE_DB_PATH = path.join(__dirname, "../../data/affiliatePrograms.json");

// Optional API keys (safe to leave empty for now)
const IMPACT_TOKEN = process.env.IMPACT_TOKEN;
const CJ_TOKEN = process.env.CJ_TOKEN;
const PARTNERSTACK_TOKEN = process.env.PARTNERSTACK_TOKEN;

// ========================
// UTIL
// ========================
function loadExisting() {
  if (!fs.existsSync(AFFILIATE_DB_PATH)) return [];
  return JSON.parse(fs.readFileSync(AFFILIATE_DB_PATH, "utf8"));
}

function save(data) {
  fs.writeFileSync(AFFILIATE_DB_PATH, JSON.stringify(data, null, 2));
}

function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function dedupe(list) {
  const map = new Map();
  for (const item of list) {
    const key = normalizeName(item.name + item.network);
    map.set(key, item);
  }
  return [...map.values()];
}

// ========================
// IMPACT (stub + real-ready)
// ========================
async function fetchImpactPrograms() {
  if (!IMPACT_TOKEN) {
    return [
      {
        name: "Notion",
        network: "impact",
        trackingUrl: "https://impact.com/c/notion",
        category: "productivity",
        commission: 30,
        active: true
      },
      {
        name: "Jasper",
        network: "impact",
        trackingUrl: "https://impact.com/c/jasper",
        category: "ai-writing",
        commission: 30,
        active: true
      }
    ];
  }

  // Real API placeholder
  const res = await fetch("https://api.impact.com/Mediapartners/{accountId}/Programs", {
    headers: {
      Authorization: `Bearer ${IMPACT_TOKEN}`
    }
  });

  const data = await res.json();

  return (data.programs || []).map(p => ({
    name: p.name,
    network: "impact",
    trackingUrl: p.trackingLink || p.defaultTrackingLink,
    category: p.category || "unknown",
    commission: p.commission || 0,
    active: true
  }));
}

// ========================
// CJ (Commission Junction)
// ========================
async function fetchCJPrograms() {
  if (!CJ_TOKEN) {
    return [
      {
        name: "Canva",
        network: "cj",
        trackingUrl: "https://www.cj.com/t/canva",
        category: "design",
        commission: 20,
        active: true
      }
    ];
  }

  const res = await fetch("https://commission-junction-api.example.com/programs", {
    headers: {
      Authorization: `Bearer ${CJ_TOKEN}`
    }
  });

  const data = await res.json();

  return (data.programs || []).map(p => ({
    name: p.programName,
    network: "cj",
    trackingUrl: p.clickUrl,
    category: p.category,
    commission: p.commissionRate,
    active: true
  }));
}

// ========================
// PARTNERSTACK
// ========================
async function fetchPartnerStackPrograms() {
  if (!PARTNERSTACK_TOKEN) {
    return [
      {
        name: "Copy.ai",
        network: "partnerstack",
        trackingUrl: "https://copy.ai/?via=pochify",
        category: "ai-writing",
        commission: 45,
        active: true
      }
    ];
  }

  const res = await fetch("https://api.partnerstack.com/programs", {
    headers: {
      Authorization: `Bearer ${PARTNERSTACK_TOKEN}`
    }
  });

  const data = await res.json();

  return (data.data || []).map(p => ({
    name: p.name,
    network: "partnerstack",
    trackingUrl: p.referral_link,
    category: p.category,
    commission: p.commission || 0,
    active: true
  }));
}

// ========================
// MAIN SYNC
// ========================
async function syncAffiliatePrograms() {
  console.log("🚀 Syncing affiliate programs...");

  const [impact, cj, partnerstack] = await Promise.all([
    fetchImpactPrograms(),
    fetchCJPrograms(),
    fetchPartnerStackPrograms()
  ]);

  let merged = [...impact, ...cj, ...partnerstack];

  // Merge with existing DB
  const existing = loadExisting();
  merged = [...existing, ...merged];

  // Deduplicate
  merged = dedupe(merged);

  // Filter invalid entries
  merged = merged.filter(p => p.name && p.trackingUrl);

  save(merged);

  console.log(`✅ Affiliate DB updated: ${merged.length} programs`);
  return merged;
}

// Run directly
if (require.main === module) {
  syncAffiliatePrograms();
}

module.exports = {
  syncAffiliatePrograms
};
