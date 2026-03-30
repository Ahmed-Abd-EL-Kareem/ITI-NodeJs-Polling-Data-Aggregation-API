const Option = require("./options.model");

// 🟡 Create Option
const createOption = async (req, res) => {
  try {
    const { pollId, text } = req.body;

    if (!pollId || !text) {
      return res.status(400).json({ message: "pollId and text are required" });
    }

    const option = new Option({
      pollId,
      text,
    });

    await option.save();

    res.status(201).json({
      message: "Option created successfully",
      option,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟡 Get Options by PollId
const getOptionsByPollId = async (req, res) => {
  try {
    const { pollId } = req.params;

    const options = await Option.find({ pollId });

    res.status(200).json({
      results: options.length,
      options,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOption,
  getOptionsByPollId,
};