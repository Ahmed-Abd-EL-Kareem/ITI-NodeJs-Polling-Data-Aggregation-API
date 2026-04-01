const  Poll = require("../poll/poll.model.js")
const Option = require("../options/options.model.js");
const Vote = require("../votes/votes.model.js");

 exports.getResults = async (req, res) => {
  console.log('1');
  
  try {
    const pollId = req.params.pollId;

    // >>> total polls >>>
    const totalPolls = await Poll.countDocuments();

    // >>>> total votes >>>>
    const totalVotes = await Vote.countDocuments();

    // >>> aggregation: find the poll with the highest number of votes 
    const mostPopularPollAgg = await Vote.aggregate([
      { $group: 
        { _id: "$pollId", votes: { $sum: 1 } } },
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
      { $group:
         { _id: "$optionId", votes: { $sum: 1 } } },
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

    const options = await Option.find({ pollId });
    const votesAgg = await Vote.aggregate([
      { $match: { pollId: poll._id } },
      { $group: { _id: "$optionId", votes: { $sum: 1 } } }
    ]);

    const votesMap = {};
    votesAgg.forEach(v => { votesMap[v._id.toString()] = v.votes; });
    const totalVotes = votesAgg.reduce((sum, v) => sum + v.votes, 0);

    const results = options.map(option => {
      const votes = votesMap[option._id.toString()] || 0;
      const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : 0;
      return {
        optionId: option._id,
        optionText: option.text,
        votes,
        percentage: Number(percentage)
      };
    });

    results.sort((a, b) => b.votes - a.votes);

    res.json({
      status: "success",
      data: {
        pollId: poll._id,
        pollTitle: poll.title,
        totalVotes,
        results
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// module.exports = getPollResults;
// module.exports = getResults; 