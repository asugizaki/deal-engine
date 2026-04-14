export function formatMessage(deal) {
  const title = deal.name || "Untitled";
  const description = deal.tagline || deal.description || "";

  const link = deal.affiliateLink || deal.url;

  const whyItMatters = deal.aiInsight ||
    "Useful tool for improving productivity and workflow efficiency.";

  return `
🔥 <b>${title}</b>

✨ <b>Why this matters:</b>
${whyItMatters}

🧠 <b>What it does:</b>
${description}

👉 <a href="${link}">Try it here</a>
`.trim();
}
