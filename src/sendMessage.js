const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_AI;

export async function sendMessage(text) {
  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    console.log("❌ Missing Telegram config");
    return false;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  const payload = {
    chat_id: CHAT_ID,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: false
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!data.ok) {
      console.log("❌ Telegram error:", data);
      return false;
    }

    return true;
  } catch (err) {
    console.log("❌ sendMessage failed:", err.message);
    return false;
  }
}
