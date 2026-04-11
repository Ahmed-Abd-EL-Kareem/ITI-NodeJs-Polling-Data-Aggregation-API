const mongoose = require("mongoose");
const Vote = require("./votes.model.js");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError.js");
const Option = require("../options/options.model.js");
const Poll = require("../poll/poll.model.js");
const PollResult = require("../results/poll-results.model.js");
const APIFeatures = require("../utils/apiFeature.js");

const getAllVotes = catchAsync(async (req, res) => {
  const features = new APIFeatures(Vote.find({}, { __v: false }), req.query)
    .filter()
    .search(["userId", "pollId", "optionId"])
    .sort()
    .limitFields()
    .paginate()

  const votes = await features.query
    .populate({ path: "userId", select: "name" })
    .populate({ path: "pollId", select: "title" })
    .populate({ path: "optionId", select: "text" });
  const total = await features.countDocuments();
  res.json({
    status: "success",
    count: votes.length,
    total,
    page: features.page,
    totalPages: Math.ceil(total / features.limit),
    data: votes
  });
});

const getSingleVote = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const singleVote = await Vote.findById(id);
  if (!singleVote) {
    return next(new AppError("No vote was found with that id", 404));
  }
  res.json({ status: "success", data: singleVote });
});

const assertPollAllowsVote = (poll) => {
  if (!poll.isActive) {
    throw new AppError("Poll is not active", 400);
  }
  if (new Date(poll.expiresAt) < new Date()) {
    throw new AppError("Poll has expired", 400);
  }
};

const createVote = catchAsync(async (req, res, next) => {
  const { pollId, optionId } = req.body;
  const userId = req.user._id;

  if (!pollId || !optionId) {
    return next(new AppError("pollId and optionId are required", 400));
  }

  const poll = await Poll.findById(pollId);
  if (!poll) {
    return next(new AppError("Poll not found", 404));
  }
  assertPollAllowsVote(poll);

  const option = await Option.findOne({ _id: optionId, pollId });
  if (!option) {
    return next(new AppError("Option does not belong to this poll", 400));
  }

  // Check if user has already voted for this poll
  const existingVote = await Vote.findOne({ userId, pollId });
  if (existingVote) {
    return next(new AppError("You have already voted for this poll", 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Vote.create([{ userId, pollId, optionId }], { session });
    await Option.findByIdAndUpdate(
      optionId,
      { $inc: { votesCount: 1 } },
      { session }
    );

    const optionKey = optionId.toString();
    await PollResult.updateOne(
      { pollId },
      {
        $inc: { totalVotes: 1, [`votesByOptionId.${optionKey}`]: 1 },
        $set: { [`optionTextsById.${optionKey}`]: option.text },
      },
      { upsert: true, session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    if (err && err.code === 11000) {
      return next(new AppError("You have already voted for this poll", 400));
    }
    throw err;
  } finally {
    await session.endSession();
  }

  const created = await Vote.findOne({ userId, pollId }).populate({
    path: "optionId",
    select: "text",
  });
  res.status(201).json({ status: "success", data: created });
});

const updatedVote = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { optionId: newOptionId } = req.body;

  if (!newOptionId) {
    return next(new AppError("optionId is required", 400));
  }

  const existing = await Vote.findById(id);
  if (!existing) {
    return next(new AppError("No vote was found with that id", 404));
  }

  const oldOptionId = existing.optionId.toString();
  if (oldOptionId === newOptionId) {
    return res.json({ status: "success", data: existing });
  }

  const poll = await Poll.findById(existing.pollId);
  if (!poll) {
    return next(new AppError("Poll not found", 404));
  }
  assertPollAllowsVote(poll);

  const newOption = await Option.findOne({
    _id: newOptionId,
    pollId: existing.pollId,
  });
  if (!newOption) {
    return next(new AppError("Option does not belong to this poll", 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updated = await Vote.findByIdAndUpdate(
      id,
      { optionId: newOptionId },
      { new: true, runValidators: true, session }
    );
    await Option.findByIdAndUpdate(
      oldOptionId,
      { $inc: { votesCount: -1 } },
      { session }
    );
    await Option.findByIdAndUpdate(
      newOptionId,
      { $inc: { votesCount: 1 } },
      { session }
    );

    await PollResult.updateOne(
      { pollId: existing.pollId },
      {
        $inc: {
          [`votesByOptionId.${oldOptionId}`]: -1,
          [`votesByOptionId.${newOptionId}`]: 1,
        },
        $set: { [`optionTextsById.${newOptionId}`]: newOption.text },
      },
      { session }
    );

    await session.commitTransaction();
    res.json({ status: "success", data: updated });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
});

const deletedVote = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const existing = await Vote.findById(id);
  if (!existing) {
    return next(new AppError("No vote was found with that id", 404));
  }

  const optionId = existing.optionId;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Vote.findByIdAndDelete(id, { session });
    await Option.findByIdAndUpdate(
      optionId,
      { $inc: { votesCount: -1 } },
      { session }
    );

    await PollResult.updateOne(
      { pollId: existing.pollId },
      {
        $setOnInsert: { pollId: existing.pollId },
        $inc: {
          totalVotes: -1,
          [`votesByOptionId.${optionId.toString()}`]: -1,
        },
      },
      { upsert: true, session }
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }

  res.json({ status: "success", message: "vote deleted successfully" });
});

module.exports = {
  getAllVotes,
  getSingleVote,
  createVote,
  updatedVote,
  deletedVote,
};
