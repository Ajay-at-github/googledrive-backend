const authService = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const { user, token } = await authService.registerUser(req.body);

    // TODO: Send activation email (next step)
    console.log("Activation token:", token);

    res.status(201).json({
      message: "Registration successful. Please activate your account.",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const activate = async (req, res) => {
  console.log("[CONTROLLER] Activation request received");
  console.log("[CONTROLLER] Query params:", req.query);
  console.log("[CONTROLLER] Token from query:", req.query.token);
  
  try {
    await authService.activateUser(req.query.token);
    console.log("[CONTROLLER] ✅ Activation successful");
    res.json({ message: "Account activated successfully" });
  } catch (err) {
    console.error("[CONTROLLER] ❌ Activation failed:", err.message);
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const token = await authService.loginUser(
      req.body.email,
      req.body.password
    );

    res.json({ token });
  } catch (err) {
    // Return 403 Forbidden for activation issues
    if (err.message.includes("activated")) {
      return res.status(403).json({ message: err.message });
    }
    res.status(400).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: "Password reset email sent" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(
      req.body.token,
      req.body.newPassword
    );
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { register, activate, login, forgotPassword, resetPassword };
