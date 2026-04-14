function formatTelegramPost(deal, affiliateLink) {
  const name = deal.name || "Untitled Tool";
  const description =
    deal.description ||
    "A useful AI/SaaS tool designed to improve productivity.";

  const audience =
    deal.audience ||
    "Founders, builders, creators, and professionals";

  const bullets = deal.benefits || [
    "Saves time and improves workflow",
    "Easy to use with minimal setup",
    "Helps you get results faster",
  ];

  return `
🔥 TRENDING TOOL

🧠 ${name}

${description}

💡 Why people use it:
- ${bullets[0]}
- ${bullets[1]}
- ${bullets[2]}

⚡ Best for:
${audience}

👉 Try it here:
${affiliateLink || deal.url}
`.trim();
}

module.exports = { formatTelegramPost };
