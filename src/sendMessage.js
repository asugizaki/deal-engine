const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// =========================
// Send message to Telegram
// =========================

export async function sendMessage(chatId, deal) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  // Build your tracking link (THIS IS THE IMPORTANT PART)
  const trackingLink = `https://go.pochify.com/go/${deal.slug}`;

  // =========================
  // Clean, conversion-focused message
  // =========================

  const message =
`🔥 <b>${deal.name}</b>

${deal.description}

👉 <b>Why this is worth your attention:</b>
• Trending new tool in its category
• Early users are seeing strong adoption
• Fast-growing demand right now

👉 <b>Try it here:</b>
${trackingLink}`;

  // =========================
  // Send to Telegram
  // =========================

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: false
    })
  });

  const data = await res.json();

  if (!data.ok) {
    console.error("❌ Telegram error:", data);
    return false;
  }

  console.log("📩 Sent:", deal.name);
  return true;
}
