const jwt = require('jsonwebtoken')
const User = require('../user/user.model')

const catchAsync = require('catch-async-wrapper-express').default

exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Unauthorized'
    })
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {

    return res.status(401).json({
      status: 'fail',
      message: 'Unauthorized'
    })
  }
  req.user = user
  next()
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(roles, (req.user.role).toString());
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: "You do not have permission to access this route"
      })
    }
    next();
  }
}