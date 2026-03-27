const jwt = require('jsonwebtoken')
const catchAsync = require('express-async-handler');
const User = require('../user/user.model');
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
  console.log(email, password);

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