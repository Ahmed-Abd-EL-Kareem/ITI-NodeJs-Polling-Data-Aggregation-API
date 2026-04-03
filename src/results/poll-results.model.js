const mongoose = require("mongoose");

const pollResultSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
      unique: true,
      index: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    // { "<optionId>": votesCount }
    votesByOptionId: {
      type: Map,
      of: Number,
      default: {},
    },
    // { "<optionId>": optionText }
    optionTextsById: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PollResult", pollResultSchema);

