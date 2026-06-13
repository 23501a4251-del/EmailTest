require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const dns = require("dns");

dns.lookup("smtp.gmail.com", { family: 4 }, (err, address) => {
  console.log("SMTP IPv4:", address);
});
const net = require("net");

const socket = net.connect(587, "smtp.gmail.com");

socket.on("connect", () => {
  console.log("✅ Able to reach Gmail SMTP");
  socket.destroy();
});

socket.on("error", (err) => {
  console.error("❌ Cannot reach Gmail SMTP");
  console.error(err);
});

const app = express();

app.use(express.json());

console.log("=== ENV CHECK ===");
console.log("EMAIL:", process.env.EMAIL);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌"
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Verification Failed");
    console.error(error);
  } else {
    console.log("✅ SMTP Server Ready");
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  console.log("GET / called");

  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// Send mail endpoint
app.post("/send-mail", async (req, res) => {
  console.log("\n========================");
  console.log("POST /send-mail received");
  console.log("Request Body:", req.body);

  try {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
      console.log("❌ Missing required fields");

      return res.status(400).json({
        success: false,
        message: "to, subject and text are required",
      });
    }

    const mailOptions = {
      from: `"Neha" <${process.env.EMAIL}>`,
      to,
      subject,
      text,
    };

    console.log("📨 Sending Email...");
    console.log(mailOptions);

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email Sent Successfully");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    res.status(200).json({
      success: true,
      messageId: info.messageId,
      response: info.response,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.error("❌ SEND MAIL ERROR");
    console.error("Name:", err.name);
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("Stack:", err.stack);

    res.status(500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
