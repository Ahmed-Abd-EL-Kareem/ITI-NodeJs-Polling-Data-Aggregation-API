const catchAsync = require('catch-async-wrapper-express').default
const User = require('./user.model')

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find()
  res.json({ status: 'success', count: users.length, data: users })
})

exports.getUserById = catchAsync(async (req, res) => {
  const id = req.params.id
  const user = await User.findById(id)
  if (!user) {
    res.status(404).json({ status: 'fail', error: 'User not found' })
    return
  }
  res.json({ status: 'success', data: user })
})

exports.updateUser = catchAsync(async (req, res) => {
  const id = req.params.id
  const user = await User.findByIdAndUpdate(id, {
    ...req.body,
    updatedAt: Date.now()
  }, { returnDocument: 'after', runValidators: true })
  if (!user) {
    return res.status(404).json({ status: 'fail', error: 'User not found' })

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