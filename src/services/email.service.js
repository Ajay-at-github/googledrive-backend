const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendActivationEmail = async (email, token) => {
  const activationLink = `${process.env.CLIENT_URL}/activate?token=${token}`;

  await transporter.sendMail({
    from: `"Google Drive Clone" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Activate your account",
    html: `
      <h3>Account Activation</h3>
      <p>Click the link below to activate your account:</p>
      <a href="${activationLink}">${activationLink}</a>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Google Drive Clone" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <h3>Password Reset</h3>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
  });
};

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
};
