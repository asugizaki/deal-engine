const https = require("https");

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const message = `
🔥 Test Deal

Notion AI is 40% off today.

👉 https://example.com
`;

const url = `https://api.telegram.org/bot${token}/sendMessage`;

const data = JSON.stringify({
  chat_id: chatId,
  text: message,
  parse_mode: "Markdown"
});

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length
  }
};

const req = https.request(url, options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
});

req.on("error", (error) => {
  console.error(error);
});

req.write(data);
req.end();
