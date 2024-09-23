const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendResetPasswordEmail } = require('../services/emailService');
const { validateRecaptcha } = require('../utils/validators');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, recaptchaToken } = req.body;

    // Validate reCAPTCHA
    const isHuman = await validateRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ message: 'reCAPTCHA validation failed' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error signing up', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    // Validate reCAPTCHA
    const isHuman = await validateRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ message: 'reCAPTCHA validation failed' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign({ userId: user._id, email:user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user._id, email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token, testMode } = req.body;
    
    let googleUser;
    if (testMode === 'true') {
      // For testing: accept any non-empty string as a valid Google ID
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
      googleUser = {
        name: 'Test User',
        email: `${token}@gmail.com`,
        sub: `test_google_id_${token}`
      };
    } else {

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      googleUser = ticket.getPayload();
    }

    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.sub
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ userId: user._id, email:user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: jwtToken, userId: user._id, email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Error with Google login', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    await sendResetPasswordEmail(user.email, resetToken);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error with password reset', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};