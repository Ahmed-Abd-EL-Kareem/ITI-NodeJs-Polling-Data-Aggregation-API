const Poll = require("./poll.model.js");
const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/appError.js");

// Get all polls
const getPolls = catchAsync(async (req, res, next) => {
  const polls = await Poll.find().populate("createdBy");

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
  }).populate("createdBy");

  res.status(201).json({
    message: "Poll created",
    data: poll
  });
});

// Get single poll
const getPoll = catchAsync(async (req, res, next) => {
  const poll = await Poll.findById(req.params.id).populate("createdBy");

  if (!poll) {
    return next(new AppError("Poll not found", 404));
  }

  res.json({
    message: "success",
    data: poll
  });
});

// Update poll
const updatePoll = catchAsync(async (req, res, next) => {
  const existing = await Poll.findById(req.params.id);
  if (!existing) {
    return next(new AppError("Poll not found", 404));
  }
  if (
    req.user.role !== "admin" &&
    existing.createdBy.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("You can only update your own polls", 403));
  }

  const poll = await Poll.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate("createdBy");

  res.json({
    message: "updated",
    data: poll
  });
});

// Delete poll (route: admin-only)
const deletePoll = catchAsync(async (req, res, next) => {
  const poll = await Poll.findByIdAndDelete(req.params.id);

  if (!poll) {
    return next(new AppError("Poll not found", 404));
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