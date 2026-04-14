export function resolveAffiliateLink(product, affiliateDB = {}) {
  const name = (product.name || "").toLowerCase();

  // 1. exact match
  if (affiliateDB[name]?.url) {
    return affiliateDB[name].url;
  }

  // 2. fuzzy match (contains)
  for (const key in affiliateDB) {
    if (name.includes(key)) {
      const url = affiliateDB[key]?.url;
      if (isValidUrl(url)) return url;
    }
  }

  return null;
}

function isValidUrl(url) {
  try {
    return new URL(url).protocol.startsWith("http");
  } catch {
    return false;
  }
}
