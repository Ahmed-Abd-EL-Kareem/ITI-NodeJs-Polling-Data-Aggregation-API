const express = require("express");
const router = express.Router();

const {
  createOption,
  getOptionsByPollId,
} = require("./options.controller");

// POST /options
router.post("/", createOption);

// GET /options/:pollId
router.get("/:pollId", getOptionsByPollId);

module.exports = router;