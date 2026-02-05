const User = require("../models/user.model");
const ActivationToken = require("../models/activationToken.model");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateRandomToken } = require("../utils/token");
const { generateToken } = require("../utils/jwt");
const emailService = require("./email.service");
const PasswordResetToken = require("../models/passwordResetToken.model");


const registerUser = async (data) => {
  const { email, firstName, lastName, password } = data;

  console.log("[REGISTER] Starting registration for:", email);

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
  console.log("[REGISTER] User created with ID:", user._id);

  const token = generateRandomToken();
  console.log("[REGISTER] Generated token:", token);
  
  try {
    const activationToken = await ActivationToken.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hrs
    });
    console.log("[REGISTER] ✅ Activation token saved to DB:", {
      id: activationToken._id,
      userId: activationToken.userId,
      token: activationToken.token,
      expiresAt: activationToken.expiresAt
    });
  } catch (error) {
    console.error("[REGISTER] ❌ Failed to create activation token:", error);
    // Clean up user if token creation fails
    await User.deleteOne({ _id: user._id });
    throw new Error("Failed to create activation token: " + error.message);
  }

  try {
    await emailService.sendActivationEmail(user.email, token);
    console.log("[REGISTER] ✅ Activation email sent to:", user.email);
  } catch (error) {
    console.error("[REGISTER] ⚠️  Failed to send activation email:", error);
    // Continue even if email fails - token is still created
  }

  console.log("[REGISTER] Registration complete for:", email);
  return { user, token };
};              

const activateUser = async (token) => {
  console.log("[ACTIVATE] Received token:", token);
  console.log("[ACTIVATE] Current time:", new Date().toISOString());
  
  const activationToken = await ActivationToken.findOne({ token });
  console.log("[ACTIVATE] Token found in DB:", activationToken ? {
    id: activationToken._id,
    userId: activationToken.userId,
    expiresAt: activationToken.expiresAt,
    isExpired: activationToken.expiresAt < new Date()
  } : "NOT FOUND");

  if (!activationToken) {
    console.log("[ACTIVATE] Token not found - checking if user already activated");
    // Check if there's an active user with recent registration (last 5 minutes)
    // This handles duplicate activation requests (browser prefetch, double-click, etc.)
    const recentUser = await User.findOne({ 
      isActive: true, 
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } 
    }).sort({ createdAt: -1 });
    
    if (recentUser) {
      console.log("[ACTIVATE] ⚠️ User recently activated, treating as success:", recentUser.email);
      return true;
    }
    
    console.error("[ACTIVATE] ❌ Token not found in database and no recent activation");
    throw new Error("Invalid or expired activation token");
  }

  if (activationToken.expiresAt < new Date()) {
    console.error("[ACTIVATE] ❌ Token has expired");
    throw new Error("Invalid or expired activation token");
  }

  const user = await User.findById(activationToken.userId);
  if (!user) {
    console.error("[ACTIVATE] ❌ User not found");
    throw new Error("User not found");
  }

  if (user.isActive) {
    console.log("[ACTIVATE] ⚠️  User already activated");
    // Delete token and return success
    await ActivationToken.deleteOne({ _id: activationToken._id });
    return true;
  }

  console.log("[ACTIVATE] Activating user:", user.email);
  user.isActive = true;
  await user.save();

  console.log("[ACTIVATE] ✅ User activated, deleting token");
  await ActivationToken.deleteOne({ _id: activationToken._id });

  console.log("[ACTIVATE] ✅ Activation complete for:", user.email);
  return true;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not registered");
  }

  if (!user.isActive) {
    throw new Error("Account not activated. Please check your email.");
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
    expiresAt: { $gt: new Date() },
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
