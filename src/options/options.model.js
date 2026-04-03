const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    votesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

optionSchema.index({ pollId: 1 });

module.exports = mongoose.model("Option", optionSchema);