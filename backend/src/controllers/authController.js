const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const { sendMail } = require('../utils/mailer');
const { v4: uuidv4 } = require('uuid');

const issueTokens = async (user) => {
  const accessToken = generateAccessToken({ userId: user._id, role: user.role });
  const refreshTokenValue = generateRefreshToken({ userId: user._id });
  await RefreshToken.create({
    token: refreshTokenValue,
    user: user._id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    family: uuidv4(),
  });
  return { accessToken, refreshToken: refreshTokenValue };
};

const publicUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  avatar: user.avatar,
  isEmailVerified: user.isEmailVerified,
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const register = async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;
    if (!fullName || !email || !password) return sendError(res, 'Full name, email and password are required', 400);
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return sendError(res, 'Email already registered', 400);
    const user = await User.create({ fullName, email: email.toLowerCase(), mobile, password, isEmailVerified: false });
    const otp = generateOtp();
    user.emailOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = 'VERIFY_EMAIL';
    await user.save({ validateBeforeSave: false });
    await sendMail({
      to: user.email,
      subject: 'EventNest verification OTP',
      text: `Your EventNest OTP is ${otp}. It expires in 10 minutes.`,
    });
    const tokens = await issueTokens(user);
    return sendSuccess(res, { user: publicUser(user), ...tokens, otp: process.env.NODE_ENV === 'production' ? undefined : otp }, 'Registration successful. Verify OTP sent to email.', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password are required', 400);
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.password) return sendError(res, 'Invalid email or password', 401);
    if (!user.isActive) return sendError(res, 'Account is disabled. Contact support.', 403);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 'Invalid email or password', 401);
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const tokens = await issueTokens(user);
    return sendSuccess(res, { user: publicUser(user), ...tokens }, 'Login successful');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      return sendError(res, 'Google Sign-In not configured on server. Please use email/password login.', 503);
    }
    const { OAuth2Client } = require('google-auth-library');
    const audiences = [
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_ANDROID_CLIENT_ID,
      process.env.GOOGLE_IOS_CLIENT_ID,
      process.env.GOOGLE_EXPO_CLIENT_ID,
    ].filter((id) => id && !id.includes('YOUR_GOOGLE'));
    if (!audiences.length) {
      return sendError(res, 'Google Sign-In not configured on server. Please use email/password login.', 503);
    }
    const client = new OAuth2Client(audiences[0]);
    const ticket = await client.verifyIdToken({ idToken, audience: audiences });
    const payload = ticket.getPayload();
    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });
    if (!user) {
      user = await User.create({ fullName: payload.name, email: payload.email, googleId: payload.sub, avatar: payload.picture, isEmailVerified: true });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      if (!user.avatar) user.avatar = payload.picture;
      await user.save({ validateBeforeSave: false });
    }
    if (!user.isActive) return sendError(res, 'Account is disabled', 403);
    const tokens = await issueTokens(user);
    return sendSuccess(res, { user: publicUser(user), ...tokens }, 'Google login successful');
  } catch (error) {
    return sendError(res, 'Google authentication failed: ' + error.message, 401);
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return sendError(res, 'Refresh token required', 400);
    const storedToken = await RefreshToken.findOne({ token, isRevoked: false });
    if (!storedToken || storedToken.expiresAt < new Date()) return sendError(res, 'Invalid or expired refresh token', 401);
    const decoded = verifyRefreshToken(token);
    storedToken.isRevoked = true;
    await storedToken.save();
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) return sendError(res, 'User not found', 401);
    const newAccessToken = generateAccessToken({ userId: user._id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user._id });
    await RefreshToken.create({ token: newRefreshToken, user: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), family: storedToken.family });
    return sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (error) {
    return sendError(res, 'Token refresh failed', 401);
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body || {};
    if (token) {
      await RefreshToken.updateMany({ user: req.user._id, token }, { isRevoked: true });
    } else {
      await RefreshToken.updateMany({ user: req.user._id, isRevoked: false }, { isRevoked: true });
    }
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getMe = async (req, res) => sendSuccess(res, { user: req.user }, 'User profile');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return sendSuccess(res, null, 'If the email exists, a reset OTP has been sent.');
    const otp = generateOtp();
    const resetToken = uuidv4();
    user.emailOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = 'FORGOT_PASSWORD';
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    await sendMail({
      to: user.email,
      subject: 'EventNest password reset OTP',
      text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
    });
    return sendSuccess(res, {
      resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken,
      otp: process.env.NODE_ENV === 'production' ? undefined : otp,
    }, 'If the email exists, a reset OTP has been sent.');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password, otp, email } = req.body;
    let user;
    if (otp && email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+emailOtp +emailOtpExpiry +otpPurpose');
      if (!user || user.emailOtp !== otp || user.emailOtpExpiry < new Date() || user.otpPurpose !== 'FORGOT_PASSWORD') {
        return sendError(res, 'Invalid or expired OTP', 400);
      }
    } else {
      user = await User.findOne({ resetPasswordToken: token, resetPasswordExpiry: { $gt: new Date() } }).select('+resetPasswordToken +resetPasswordExpiry');
    }
    if (!user) return sendError(res, 'Invalid or expired reset token', 400);
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    user.otpPurpose = undefined;
    await user.save();
    return sendSuccess(res, null, 'Password reset successful');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.fullName !== undefined) updates.fullName = req.body.fullName.trim();
    if (req.body.mobile !== undefined) updates.mobile = req.body.mobile.trim();
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    return sendSuccess(res, { user: publicUser(user) }, 'Profile updated');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user.password) return sendError(res, 'No password set. Use Google login.', 400);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, 'Current password is incorrect', 400);
    user.password = newPassword;
    await user.save();
    return sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email, purpose = 'VERIFY_EMAIL' } = req.body;
    if (!email) return sendError(res, 'Email is required', 400);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return sendError(res, 'No account found for this email', 404);
    const otp = generateOtp();
    user.emailOtp = otp;
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = purpose;
    await user.save({ validateBeforeSave: false });
    await sendMail({
      to: user.email,
      subject: 'EventNest OTP',
      text: `Your EventNest OTP is ${otp}. It expires in 10 minutes.`,
    });
    return sendSuccess(res, { otp: process.env.NODE_ENV === 'production' ? undefined : otp }, 'OTP sent');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return sendError(res, 'Email and OTP are required', 400);
    const user = await User.findOne({ email: email.toLowerCase() }).select('+emailOtp +emailOtpExpiry +otpPurpose');
    if (!user) return sendError(res, 'User not found', 404);
    if (!user.emailOtp || user.emailOtp !== otp || user.emailOtpExpiry < new Date()) {
      return sendError(res, 'Invalid or expired OTP', 400);
    }
    if (user.otpPurpose === 'VERIFY_EMAIL' || !user.isEmailVerified) {
      user.isEmailVerified = true;
    }
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    const tokens = await issueTokens(user);
    return sendSuccess(res, { user: publicUser(user), ...tokens, verified: true }, 'OTP verified');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = { register, login, googleAuth, refreshTokenHandler, logout, getMe, forgotPassword, resetPassword, updateProfile, changePassword, sendOtp, verifyOtp };
