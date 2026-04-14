const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendMessage(chatId, deal) {
  console.log("🚀 sendMessage CALLED for:", deal.name);

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const trackingLink = `https://go.pochify.com/go/${deal.slug}`;

  const message =
`🔥 <b>${deal.name}</b>

${deal.description}

👉 ${trackingLink}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      })
    });

    const data = await res.json();

    console.log("📩 Telegram RESPONSE:", data);

    if (!data.ok) {
      console.error("❌ Telegram FAILED:", data);
      return false;
    }

    console.log("✅ Telegram SENT:", deal.name);
    return true;

  } catch (err) {
    console.error("❌ sendMessage ERROR:", err);
    return false;
  }
}
