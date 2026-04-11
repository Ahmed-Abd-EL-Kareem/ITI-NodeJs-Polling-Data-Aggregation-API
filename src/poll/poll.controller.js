const Poll = require("./poll.model.js");
const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/appError.js");
const APIFeatures = require("../utils/apiFeature.js");

// Get all polls
const getPolls = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Poll.find(), req.query)
    .filter()
    .search(["title", "description"])
    .sort()
    .limitFields()
    .paginate();

  const polls = await features.query.populate("createdBy");
  const total = await features.countDocuments();

  res.json({
    message: "success",
    count: polls.length,
    total,
    page: features.page,
    totalPages: Math.ceil(total / features.limit),
    data: polls
  });
});

// Create poll
const createPoll = catchAsync(async (req, res, next) => {
  const { title, description, expiresAt } = req.body;
  const rawCover = req.body.coverImage ?? req.body.image;
  const trimmedCover =
    typeof rawCover === "string" && rawCover.trim() ? rawCover.trim() : undefined;

  const poll = await Poll.create({
    title,
    description,
    expiresAt,
    coverImage: trimmedCover,
    createdBy: req.user?._id // لو protect شغال
  });
  await poll.populate("createdBy");

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

  const body = { ...req.body };
  if (body.image != null && body.coverImage == null) {
    body.coverImage = body.image;
  }
  delete body.image;

  const poll = await Poll.findByIdAndUpdate(
    req.params.id,
    body,
    { new: true, runValidators: true }
  ).populate("createdBy");

  res.json({
    message: "updated",
    data: poll
  });
});

// Delete poll
const deletePoll = catchAsync(async (req, res, next) => {
  const existing = await Poll.findById(req.params.id);
  if (!existing) {
    return next(new AppError("Poll not found", 404));
  }
  if (
    req.user.role !== "admin" &&
    existing.createdBy.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("You can only delete your own polls", 403));
  }

  await Poll.findByIdAndDelete(req.params.id);

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