const Poll = require("./poll.model.js");
const catchAsync = require("../utils/catchAsync.js");

// Get all polls
const getPolls = catchAsync(async (req, res, next) => {
  const polls = await Poll.find();

  res.json({
    message: "success",
    data: polls
  });
});

// Create poll
const createPoll = catchAsync(async (req, res, next) => {
  const { title, description, expiresAt } = req.body;

  const poll = await Poll.create({
    title,
    description,
    expiresAt,
    createdBy: req.user?._id // لو protect شغال
  });

  res.status(201).json({
    message: "Poll created",
    data: poll
  });
});

// Get single poll
const getPoll = catchAsync(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id);

  if (!poll) {
    return next(new Error("Poll not found"));
  }

  res.json({
    message: "success",
    data: poll
  });
});

// Update poll
const updatePoll = catchAsync(async (req, res, next) => {
  const poll = await Poll.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!poll) {
    return next(new Error("Poll not found"));
  }

  res.json({
    message: "updated",
    data: poll
  });
});

// Delete poll
const deletePoll = catchAsync(async (req, res, next) => {
  const poll = await Poll.findByIdAndDelete(req.params.id);

  if (!poll) {
    return next(new Error("Poll not found"));
  }

  res.json({
    message: "deleted"
  });
});

module.exports = {
  createPoll,
  getPolls,
  getPoll,
  updatePoll,
  deletePoll
};