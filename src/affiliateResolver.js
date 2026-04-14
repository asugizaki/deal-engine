const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/affiliatePrograms.json");

function loadDB() {
  if (!fs.existsSync(DB_PATH)) return [];
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function normalize(str = "") {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findAffiliate(dealName) {
  const db = loadDB();
  const dealKey = normalize(dealName);

  let bestMatch = null;
  let bestScore = 0;

  for (const program of db) {
    const programKey = normalize(program.name);

    let score = 0;

    if (dealKey.includes(programKey) || programKey.includes(dealKey)) {
      score += 10;
    }

    // fuzzy overlap
    const overlap = programKey.split("").filter(c => dealKey.includes(c)).length;
    score += overlap;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = program;
    }
  }

  if (!bestMatch || bestScore < 5) {
    return {
      hasAffiliate: false,
      affiliate: null
    };
  }

  return {
    hasAffiliate: true,
    affiliate: bestMatch
  };
}

module.exports = { findAffiliate };
