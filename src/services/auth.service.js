const User = require("../models/user.model");
const ActivationToken = require("../models/activationToken.model");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateRandomToken } = require("../utils/token");
const { generateToken } = require("../utils/jwt");
const emailService = require("./email.service");
const PasswordResetToken = require("../models/passwordResetToken.model");


const registerUser = async (data) => {
  const { email, firstName, lastName, password } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    email,
    firstName,
    lastName,
    passwordHash,
    isActive: false,
  });

  const token = generateRandomToken();
  
  await ActivationToken.create({
    userId: user._id,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hrs
  });

  await emailService.sendActivationEmail(user.email, token);
  return { user, token };
};              

const activateUser = async (token) => {
  const activationToken = await ActivationToken.findOne({ token });

  if (!activationToken) {
    throw new Error("Invalid or expired activation token");
  }

  const user = await User.findById(activationToken.userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.isActive = true;
  await user.save();

  await ActivationToken.deleteOne({ _id: activationToken._id });

  return true;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not registered");
  }

  if (!user.isActive) {
    throw new Error("Account not activated");
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    userId: user._id,
    email: user.email,
  });

  return token;
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not registered");
  }

  const token = generateRandomToken();

  await PasswordResetToken.create({
    userId: user._id,
    token,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
  });

  await emailService.sendPasswordResetEmail(user.email, token);
};

const resetPassword = async (token, newPassword) => {
  const resetToken = await PasswordResetToken.findOne({
    token,
    used: false,
  });

  if (!resetToken) {
    throw new Error("Invalid or expired reset token");
  }

  const user = await User.findById(resetToken.userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  resetToken.used = true;
  await resetToken.save();
};


module.exports = {
  registerUser,
  activateUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
