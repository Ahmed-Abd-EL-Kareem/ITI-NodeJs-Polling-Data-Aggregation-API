const express = require('express');
const votesRouter = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
votesRouter.use(protect);
const { getAllVotes,
    getSingleVote,
    createVote,
    updatedVote,
    deletedVote
} = require('./votes.controller');
votesRouter.route('/')
    .get(getAllVotes)
    .post(protect, restrictTo('user', 'admin'), createVote)
votesRouter.route('/:id')
    .get(protect, getSingleVote)
    .patch(protect, restrictTo('admin'), updatedVote)
    .delete(protect, restrictTo('admin'), deletedVote)
module.exports = votesRouter;