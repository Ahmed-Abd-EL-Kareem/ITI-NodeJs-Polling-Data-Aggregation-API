const express = require('express');
const {protect} = require('../middleware/auth.middleare.js');

const {
  createPoll,
  getPolls,
  getPoll,
  updatePoll,
  deletePoll,
} = require('./poll.controller.js');

const router = express.Router();

router.post('/', protect, createPoll);
router.get('/', getPolls);
router.get('/:id', getPoll);
router.patch('/:id', protect,updatePoll);
router.delete('/:id', protect ,deletePoll);

module.exports = router;
