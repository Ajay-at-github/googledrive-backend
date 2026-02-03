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
  try {
    await authService.activateUser(req.query.token);
    res.json({ message: "Account activated successfully" });
  } catch (err) {
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
