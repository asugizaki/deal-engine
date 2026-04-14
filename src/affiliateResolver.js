export function resolveAffiliateLink(product, affiliateDB = {}) {
  const name = (product.name || "").toLowerCase();

  for (const key in affiliateDB) {
    const entry = affiliateDB[key];

    const keywords = entry.keywords || [];

    if (keywords.some(k => name.includes(k))) {
      if (isValidUrl(entry.url)) {
        return entry.url;
      }
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
