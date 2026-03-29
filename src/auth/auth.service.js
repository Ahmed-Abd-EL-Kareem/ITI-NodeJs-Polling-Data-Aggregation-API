const jwt = require('jsonwebtoken')
const User = require('../user/user.model');
const path = require('path')
const ejs = require('ejs');
const { sendEmail } = require('../config/mail');
const catchAsync = require('../utils/catchAsync');
const { forgotPassword } = require('./forget-password.service');
const { resetPassword } = require('./reset-password');
const sendMailTrap = require('../config/mail');
const signToken = (id, email, secret) => {
  return jwt.sign({ id, email }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}
const signRefreshToken = (id, email, secret) => {
  return jwt.sign({ id, email }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  });
}

exports.register = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role
  });
  if (!user) {
    return res.status(500).json({
      status: 'fail',
      message: 'Server Error'
    })
  }
  const token = signToken(user.id, user.email, process.env.JWT_SECRET)
  const refreshToken = signRefreshToken(user.id, user.email, process.env.JWT_REFRESH_TOKEN)

  const templatePath = path.join(
    __dirname,
    '../../view/welcome.ejs'
  );

  const html = await ejs.renderFile(templatePath, {
    name: user.name,
    appUrl: process.env.BASE_URL,
  });

  try {
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Welcome to Our Platform 🎉',
    //   html,
    // });
    await sendMailTrap({
      to: user.email,
      subject: 'Welcome to Our Platform 🎉',
      html,
    });
  } catch (err) {
    console.error('Email failed:', err.message);
  }
  res.status(201).json({
    status: 'success',
    data: {
      user,
      token,
      refreshToken
    }
  })
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'There is No email or Password'
    })
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.passwordCompare(user.password, password))) {
    return res.status(401).json({
      status: 'fail',
      message: 'Incorrect Email or Password'
    })
  }
  const token = signToken(user.id, user.email, process.env.JWT_SECRET)
  const refreshToken = signRefreshToken(user.id, user.email, process.env.JWT_REFRESH_TOKEN)
  const cookieOptions = {
    expires: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "None"
  }
  res.cookie("jwt", token, cookieOptions)
  res.status(200).json({
    status: 'success',
    token,
    refreshToken,
    data: { user }
  })
})


exports.forgotUserPassword = catchAsync(async (req, res) => {
  await forgotPassword(req.body.email)
  res.status(200).json({
    status: 'success',
    message: 'Reset email sent',
  })
});
exports.resetUserPassword = catchAsync(async (req, res) => {
  await resetPassword(req.params.token, req.body.password);

  res.status(200).json({
    status: 'success',
    message: 'Password updated',
  })
})

exports.googleCallback = (req, res) => {
  const user = req.user;

  const token = signToken(user.id, user.email, process.env.JWT_SECRET);
  const refreshToken = signRefreshToken(
    user.id,
    user.email,
    process.env.JWT_REFRESH_TOKEN
  );

  res.status(200).json({
    status: 'success',
    token,
    refreshToken,
    data: { user }
  });
};