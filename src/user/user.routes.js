const express = require('express');
const { register, login } = require('../auth/auth.service');
const { protect, restrictTo } = require('../middleware/auth.middleare');
const { getAllUsers, deleteUser, getUserById, updateUser } = require('./user.controller');

const router = express.Router();

router.post('/register', register)
router.post('/login', login)

router.use(protect)
router.route('/').get(restrictTo('admin'), getAllUsers).delete(restrictTo('admin', deleteUser))
router.route('/:id').get(getUserById).patch(updateUser)
module.exports = router