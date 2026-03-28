const User = require("../user/user.model");
const AppError = require("../utils/appError");
const crypto = require('crypto')

exports.resetPassword = (async (token, newPass) => {

  const hashToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+password')

  if (!user) {
    throw new AppError('Token invalid or expired', 400);
  }
  user.password = newPass;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save()
})