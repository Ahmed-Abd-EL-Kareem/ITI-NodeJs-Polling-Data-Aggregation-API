const Option = require("./options.model");
const Poll = require("../poll/poll.model");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const PollResult = require("../results/poll-results.model");

const createOption = catchAsync(async (req, res, next) => {
  const { pollId, text } = req.body;

  if (!pollId || !text) {
    return next(new AppError("pollId and text are required", 400));
  }

  const poll = await Poll.findById(pollId);
  if (!poll) {
    return next(new AppError("Poll not found", 404));
  }
  if (
    req.user.role !== "admin" &&
    poll.createdBy.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("You can only add options to your own polls", 403));
  }

  const option = await Option.create({ pollId, text });

  // Ensure we have a PollResult doc for fast reads later.
  // If a vote happens before the client creates all options, vote writes will also upsert.
  const optionKey = option._id.toString();
  await PollResult.updateOne(
    { pollId },
    {
      $set: { [`optionTextsById.${optionKey}`]: option.text },
      $setOnInsert: {
        totalVotes: 0,
        [`votesByOptionId.${optionKey}`]: 0,
      },
    },
    { upsert: true }
  );

  res.status(201).json({
    message: "Option created successfully",
    option,
  });
});

const getOptionsByPollId = catchAsync(async (req, res) => {
  const { pollId } = req.params;

  const options = await Option.find({ pollId }).populate("pollId");

  res.status(200).json({
    results: options.length,
    options,
  });
});

module.exports = {
  createOption,
  getOptionsByPollId,
};