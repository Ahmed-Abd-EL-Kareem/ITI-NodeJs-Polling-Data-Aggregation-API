const Poll = require("../poll/poll.model.js")
const Option = require("../options/options.model.js");
const Vote = require("../votes/votes.model.js");
const PollResult = require("./poll-results.model");

exports.getResults = async (req, res) => {
  try {
    // >>> total polls >>>
    const totalPolls = await Poll.countDocuments();

    // >>>> total votes >>>>
    const totalVotes = await Vote.countDocuments();

    // >>> aggregation: find the poll with the highest number of votes 
    const mostPopularPollAgg = await Vote.aggregate([
      {
        $group:
          { _id: "$pollId", votes: { $sum: 1 } }
      },
      { $sort: { votes: -1 } },
      { $limit: 1 }
    ]);

    let mostPopularPoll = null;
    if (mostPopularPollAgg.length > 0) {
      const poll = await Poll.findById(mostPopularPollAgg[0]._id);
      mostPopularPoll = {
        pollId: poll._id,
        title: poll.title,
        votes: mostPopularPollAgg[0].votes
      };
    }

    //  aggregation: find the option with the highest number of votes
    const mostVotedOptionAgg = await Vote.aggregate([
      {
        $group:
          { _id: "$optionId", votes: { $sum: 1 } }
      },
      { $sort: { votes: -1 } },
      { $limit: 1 }
    ]);

    let mostVotedOption = null;
    if (mostVotedOptionAgg.length > 0) {
      const option = await Option.findById(mostVotedOptionAgg[0]._id);
      mostVotedOption = {
        optionId: option._id,
        optionText: option.text,
        votes: mostVotedOptionAgg[0].votes
      };
    }

    //  Response
    res.json({
      status: "success",
      data: {
        totalPolls,
        totalVotes,
        mostPopularPoll,
        mostVotedOption
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


exports.getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ status: "error", message: "Poll not found" });

    const pollResult = await PollResult.findOne({ pollId: poll._id });

    const getMapVal = (m, key) => {
      if (!m) return undefined;
      if (typeof m.get === "function") return m.get(key);
      return m[key];
    };

    // Fast path: read precomputed counters
    const optionTexts = pollResult?.optionTextsById;
    const hasPrecomputed =
      optionTexts &&
      ((typeof optionTexts.size === "number" && optionTexts.size > 0) ||
        (Array.isArray(optionTexts) === false && Object.keys(optionTexts).length > 0));

    if (hasPrecomputed) {
      const optionTextsEntries =
        typeof optionTexts?.entries === "function"
          ? Array.from(optionTexts.entries())
          : Object.entries(optionTexts);

      const votesByOptionId = pollResult.votesByOptionId || {};
      const votesEntries =
        typeof votesByOptionId?.entries === "function"
          ? Array.from(votesByOptionId.entries())
          : Object.entries(votesByOptionId);

      const optionIdSet = new Set([
        ...optionTextsEntries.map(([id]) => id),
        ...votesEntries.map(([id]) => id),
      ]);

      const totalVotes = pollResult.totalVotes || 0;
      const results = Array.from(optionIdSet).map((optId) => {
        const votes = Number(getMapVal(pollResult.votesByOptionId, optId) || 0);
        const percentage =
          totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : 0;
        return {
          optionId: optId,
          optionText: String(getMapVal(pollResult.optionTextsById, optId) || ""),
          votes,
          percentage: Number(percentage),
        };
      });

      results.sort((a, b) => b.votes - a.votes);

      return res.json({
        status: "success",
        data: {
          pollId: poll._id,
          pollTitle: poll.title,
          totalVotes,
          results,
        },
      });
    }

    // Fallback: old behavior (for old data before PollResult was introduced)
    const options = await Option.find({ pollId });
    const votesAgg = await Vote.aggregate([
      { $match: { pollId: poll._id } },
      { $group: { _id: "$optionId", votes: { $sum: 1 } } },
    ]);

    const votesMap = {};
    votesAgg.forEach((v) => {
      votesMap[v._id.toString()] = v.votes;
    });
    const totalVotes = votesAgg.reduce((sum, v) => sum + v.votes, 0);

    const results = options.map((option) => {
      const votes = votesMap[option._id.toString()] || 0;
      const percentage =
        totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : 0;
      return {
        optionId: option._id,
        optionText: option.text,
        votes,
        percentage: Number(percentage),
      };
    });

    results.sort((a, b) => b.votes - a.votes);

    // Backfill PollResult for old polls so subsequent requests are fast.
    // This is intentionally "lazy" to avoid a manual migration step.
    const optionTextsObj = {};
    const votesObj = {};
    options.forEach((option) => {
      const optKey = option._id.toString();
      optionTextsObj[optKey] = option.text;
      votesObj[optKey] = votesMap[optKey] || 0;
    });
    await PollResult.updateOne(
      { pollId: poll._id },
      { $set: { totalVotes, optionTextsById: optionTextsObj, votesByOptionId: votesObj } },
      { upsert: true }
    );

    return res.json({
      status: "success",
      data: {
        pollId: poll._id,
        pollTitle: poll.title,
        totalVotes,
        results,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};