const jwt = require('jsonwebtoken')
const User = require('../user/user.model')
const catchAsync = require('../utils/catchAsync')


exports.protect = catchAsync(async (req, res, next) => {
  let token = req.cookies?.jwt
  const authHeader = req.headers.authorization
  if (!token && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim()
  }
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Unauthorized'
    })
  }
  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token'
    })
  }
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
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: "You do not have permission to access this route"
      })
    }
    next();
  }
}
