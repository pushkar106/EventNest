const nodemailer = require('nodemailer');

const isSmtpConfigured = () =>
  process.env.SMTP_USER && !process.env.SMTP_USER.includes('your@');

const sendMail = async ({ to, subject, text, html }) => {
  if (!isSmtpConfigured()) {
    console.log('📧 [DEV EMAIL - SMTP not configured]');
    console.log('   To:', to);
    console.log('   Subject:', subject);
    console.log('   Body:', text);
    return { mocked: true };
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"EventNest" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
  return { mocked: false };
};

module.exports = { sendMail, isSmtpConfigured };
