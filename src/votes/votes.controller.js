const vote = require("./votes.model.js");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError.js')
const optionModel = require("../options/options.model.js")

const getAllVotes = catchAsync(async (req, res,) => {
  const votes = await vote
    .find({}, { "__v": false })
    .populate({ path: "userId", select: "name" })
    .populate({ path: "pollId", select: "title" })
    .populate({ path: "optionId", select: "text" });
  res.json({ status: "success", data: votes });
});

const getSingleVote = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const singleVote = await vote.findById(id);
  if (!singleVote) {
    const error = new AppError("No vote was found with that id", 404);
    return next(error);
  }
  res.json({ status: "success", data: singleVote });
});
const createVote = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId, pollId, optionId } = req.body;
  const newVote = await vote.create({ userId, pollId, optionId });
  await optionModel.findByIdAndUpdate(id, { $inc: { votesCount: 1 } })
  res.status(201).json({ status: "success", data: newVote });
})

const updatedVote = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { optionId } = req.body;
  const updatedVote = await vote.findByIdAndUpdate(id, { optionId }, {
    returnDocument: "after",
    runValidators: true
  });
  if (!updatedVote) {
    const error = new AppError("No vote was found with that id", 404);
    return next(error);
  }
  res.json({ status: "success", data: updatedVote });
})

const deletedVote = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deletedVote = await vote.findByIdAndDelete(id);
  await optionModel.findByIdAndUpdate(id, { $inc: { votesCount: -1 } })
  if (!deletedVote) {
    const error = new AppError("No vote was found with that id", 404);
    return next(error);
  }
  res.json({ status: "success", message: "vote deleted successfully" });
});
module.exports = {
  getAllVotes,
  getSingleVote,
  createVote,
  updatedVote,
  deletedVote
}