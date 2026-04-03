const catchAsync = require('../utils/catchAsync')
const User = require('./user.model')
const AppError = require('../utils/appError')

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find()
  res.json({ status: 'success', count: users.length, data: users })
})

exports.getUserById = catchAsync(async (req, res, next) => {
  const id = req.params.id
  if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
    return next(new AppError('You do not have permission to view this user', 403))
  }
  const user = await User.findById(id)
  if (!user) {
    return next(new AppError('User not found', 404))
  }
  res.json({ status: 'success', data: user })
})

exports.updateUser = catchAsync(async (req, res, next) => {
  const id = req.params.id
  if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
    return next(new AppError('You can only update your own profile', 403))
  }
  const payload = { ...req.body }
  if (req.user.role !== 'admin') {
    delete payload.role
  }
  const user = await User.findByIdAndUpdate(
    id,
    { ...payload, updatedAt: Date.now() },
    { returnDocument: 'after', runValidators: true }
  )
  if (!user) {
    return next(new AppError('User not found', 404))
  }
  res.json({ status: 'success', data: user })
})

exports.deleteUser = catchAsync(async (req, res) => {
  const id = req.params.id
  const user = await User.findByIdAndDelete(id)
  if (!user) {
    return res.status(404).json({ status: 'fail', error: 'User not found' })

  }
  res.json({ status: 'success', data: user })
})
