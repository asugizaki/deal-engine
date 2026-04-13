const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ----------------------
// VALIDATE CHAT ID
// ----------------------
function isValidChatId(chatId) {
  if (!chatId) return false;

  // Valid formats:
  // -100xxxxxxxxxx (channel)
  // 123456789 (user)
  return /^-?\d+$/.test(String(chatId));
}

// ----------------------
// CLEAN MESSAGE (extra safety)
// ----------------------
function sanitizeText(text = "") {
  return String(text)
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[\x00-\x1F\x7F]/g, "") // control chars
    .trim();
}

// ----------------------
// SEND MESSAGE
// ----------------------
async function sendMessage(chatId, text) {
  try {
    // 🚨 HARD GUARD (prevents swapped params bug)
    if (!isValidChatId(chatId)) {
      console.error("❌ INVALID CHAT ID:", chatId);
      console.error("❌ Likely cause: parameters swapped (message passed as chatId)");
      return { status: 400, body: "Invalid chat_id" };
    }

    if (!text || typeof text !== "string") {
      console.error("❌ INVALID MESSAGE TEXT");
      return { status: 400, body: "Invalid text" };
    }

    const cleanText = sanitizeText(text);

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    console.log("➡️ Sending to chat_id:", chatId);
    console.log("🧪 Message length:", cleanText.length);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: cleanText,
        parse_mode: "HTML",
        disable_web_page_preview: false
      })
    });

    const data = await res.text();

    console.log("📩 Telegram response status:", res.status);
    console.log("📩 Telegram response body:", data);

    return {
      status: res.status,
      body: data
    };

  } catch (err) {
    console.error("❌ SEND ERROR:", err.message);

    return {
      status: 500,
      body: err.message
    };
  }
}

module.exports = sendMessage;
