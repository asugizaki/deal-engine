export function resolveAffiliateLink(product, affiliateDB = {}) {
  const key = (product.name || "").toLowerCase();

  const affiliate = affiliateDB[key];

  // ✅ If we have a real affiliate link, use it
  if (affiliate?.url && isValidUrl(affiliate.url)) {
    return affiliate.url;
  }

  // ❌ DO NOT generate fake tracking URLs
  return null;
}

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
