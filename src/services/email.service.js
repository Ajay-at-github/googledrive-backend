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
    from: `"CloudDrive" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Activate your account",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #111111; line-height: 1.6;">
        <p>Hi there,</p>
        <p>Welcome to CloudDrive! Please verify your email address by clicking the button below:</p>
        <p>
          <a
            href="${activationLink}"
            style="display: inline-block; background: #6a00ff; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 4px; font-weight: 600;"
          >Verify your email</a>
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not sign up for a CloudDrive account, you can safely ignore this email.</p>
        <p>Best,<br />The CloudDrive Team</p>
        <p style="color: #777777; font-size: 12px;">© 2026 CloudDrive. Secure cloud storage for everyone.</p>
      </div>
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
