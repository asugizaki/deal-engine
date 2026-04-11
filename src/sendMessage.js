const https = require("https");

function sendMessage(token, chatId, message) {
  return new Promise((resolve, reject) => {
    console.log(`➡️ Sending message to: ${chatId}`);

    const data = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    });

    const options = {
      hostname: "api.telegram.org",
      path: `/bot${token}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        console.log(`📩 Telegram response status: ${res.statusCode}`);
        console.log(`📩 Telegram response body: ${body}`);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on("error", (error) => {
      console.error("❌ Request error:", error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

module.exports = sendMessage;
