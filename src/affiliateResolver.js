export function resolveAffiliateLink(product, affiliateDB = {}) {
  const name = (product.name || "").toLowerCase();

  if (!affiliateDB || Object.keys(affiliateDB).length === 0) {
    return null;
  }

  // 🟢 1. exact match
  for (const key in affiliateDB) {
    if (name === key.toLowerCase()) {
      const url = affiliateDB[key]?.url;
      if (isValidUrl(url)) return url;
    }
  }

  // 🟡 2. fuzzy keyword match
  for (const key in affiliateDB) {
    const entry = affiliateDB[key];
    const keywords = entry.keywords || [];

    if (keywords.some(k => name.includes(k.toLowerCase()))) {
      const url = entry.url;
      if (isValidUrl(url)) return url;
    }
  }

  return null;
}

function isValidUrl(url) {
  try {
    if (!url) return false;
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
