const express = require('express');
const votesRouter = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleare');
votesRouter.use(protect);
const {   getAllVotes,
    getSingleVote,
    createVote,
    updatedVote,
    deletedVote
} = require('./votes.controller');
votesRouter.route('/')
.get(protect,getAllVotes)
.post(protect,restrictTo('user', 'admin'),createVote)
votesRouter.route('/:id')
.get(protect,getSingleVote)
.patch(protect,restrictTo('admin','user'),updatedVote)
.delete(protect,restrictTo('admin','user'),deletedVote)
module.exports = votesRouter;