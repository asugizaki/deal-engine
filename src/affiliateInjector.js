// src/affiliateInjector.js

function injectAffiliateLink(url) {
  if (!url) return url;

  // -----------------------------
  // DIRECT AFFILIATE REPLACEMENTS
  // -----------------------------
  const directMap = [
    {
      match: "notion.so",
      param: process.env.AFF_NOTION
    },
    {
      match: "jasper.ai",
      param: process.env.AFF_JASPER
    },
    {
      match: "copy.ai",
      param: process.env.AFF_COPYAI
    },
    {
      match: "writesonic.com",
      param: process.env.AFF_WRITESONIC
    },
    {
      match: "canva.com",
      param: process.env.AFF_CANVA
    }
  ];

  for (const item of directMap) {
    if (url.includes(item.match) && item.param) {
      return item.param; // full affiliate URL override
    }
  }

  // -----------------------------
  // GENERIC PARAM INJECTION
  // -----------------------------
  const fallbackRef = process.env.AFF_REF;

  if (fallbackRef && !url.includes("ref=")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}ref=${fallbackRef}`;
  }

  return url;
}

module.exports = { injectAffiliateLink };
