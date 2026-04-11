const express = require('express');
const { register, login, forgotUserPassword, resetUserPassword, googleCallback } = require('../auth/auth.service');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { getAllUsers, deleteUser, getUserById, updateUser } = require('./user.controller');

const passport = require('../auth/passport');
const { authLimiter } = require('../middleware/rate-limit.middleware');

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  googleCallback
);

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/forgot-password', authLimiter, forgotUserPassword)
router.post('/reset-password/:token', authLimiter, resetUserPassword)

router.use(protect)
router.route('/').get(restrictTo('admin'), getAllUsers)
router.route('/:id').get(getUserById).patch(updateUser).delete(restrictTo('admin'), deleteUser)
module.exports = router
