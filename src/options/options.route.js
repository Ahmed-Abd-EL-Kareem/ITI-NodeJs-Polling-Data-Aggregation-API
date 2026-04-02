const express = require("express");
const router = express.Router();

const {
  createOption,
  getOptionsByPollId,
} = require("./options.controller");
const { protect } = require("../middleware/auth.middleware");
// POST /options
router.post("/", protect, createOption);

// GET /options/:pollId
router.get("/:pollId", protect, getOptionsByPollId);

module.exports = router;