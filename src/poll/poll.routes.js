const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware.js');

const {
  createPoll,
  getPolls,
  getPollsByUser,
  getPoll,
  updatePoll,
  deletePoll,
} = require('./poll.controller.js');

const router = express.Router();

router.post('/', protect, createPoll);
router.get('/', getPolls);
router.get('/user/:userId', getPollsByUser);
router.get('/:id', getPoll);
router.patch('/:id', protect, updatePoll);
router.delete('/:id', protect, deletePoll);

module.exports = router;
