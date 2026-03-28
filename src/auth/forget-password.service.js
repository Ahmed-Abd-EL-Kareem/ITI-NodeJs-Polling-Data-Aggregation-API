const User = require("../user/user.model");
const path = require('path')
const ejs = require('ejs');
const AppError = require("../utils/appError");
const { generateResetToken } = require("../utils/reset-token");
const { sendEmail } = require("../config/mail");
const catchAsync = require("../utils/catchAsync");

exports.forgotPassword = catchAsync(async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    return new AppError("User not found", 400)
  }
  const { resetToken, hashToken } = generateResetToken();
  user.resetPasswordToken = hashToken;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000 // 10 Mint 
  await user.save();
  const resetUrl = `${process.env.BASE_URL}/api/v1/users/reset-password/${resetToken}`

  const templatePath = path.join(
    __dirname, '../../view/reset-password.ejs'
  )
  const html = await ejs.renderFile(templatePath, { name: user.name, resetUrl })
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html,
    })
  } catch (err) {
    console.error('Email failed:', err.message);
  }
})