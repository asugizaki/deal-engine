import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ========================
// PATH FIX (ESM SAFE)
// ========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AFFILIATE_DB_PATH = path.join(__dirname, "../../data/affiliatePrograms.json");

// ========================
// ENV
// ========================
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
// IMPACT (stub)
// ========================
async function fetchImpactPrograms() {
  return [
    {
      name: "Notion",
      network: "impact",
      trackingUrl: "https://impact.com/c/notion",
      category: "productivity",
      commission: 30,
      active: true
    }
  ];
}

// ========================
// CJ (stub)
// ========================
async function fetchCJPrograms() {
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

// ========================
// PARTNERSTACK (stub)
// ========================
async function fetchPartnerStackPrograms() {
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

// ========================
// SYNC
// ========================
export async function syncAffiliatePrograms() {
  console.log("🚀 Syncing affiliate programs...");

  const [impact, cj, partnerstack] = await Promise.all([
    fetchImpactPrograms(),
    fetchCJPrograms(),
    fetchPartnerStackPrograms()
  ]);

  let merged = [...impact, ...cj, ...partnerstack];

  const existing = loadExisting();
  merged = [...existing, ...merged];

  merged = dedupe(merged);
  merged = merged.filter(p => p.name && p.trackingUrl);

  save(merged);

  console.log(`✅ Affiliate DB updated: ${merged.length} programs`);
  return merged;
}
