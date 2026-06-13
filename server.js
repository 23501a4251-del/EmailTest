require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");

const app = express();

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// Send mail endpoint
app.post("/send-mail", async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    const info = await transporter.sendMail({
      from: `"Neha" <${process.env.EMAIL}>`,
      to,
      subject,
      text,
    });

    res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
