const express = require('express');
const { register, login, forgotUserPassword, resetUserPassword, googleCallback } = require('../auth/auth.service');
const { protect, restrictTo } = require('../middleware/auth.middleare');
const { getAllUsers, deleteUser, getUserById, updateUser } = require('./user.controller');

const passport = require('../auth/passport');

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

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotUserPassword)
router.post('/reset-password/:token', resetUserPassword)

router.use(protect)
router.route('/').get(restrictTo('admin'), getAllUsers).delete(restrictTo('admin', deleteUser))
//router.route('/:id').get(getUserById).patch(updateUser)
module.exports = router