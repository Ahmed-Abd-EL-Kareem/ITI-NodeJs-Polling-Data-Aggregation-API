const express = require('express')
const {getResults} = require('./result.controller.js')
const {getPollResults} = require('./result.controller.js'); // import الكونترولر
const { protect } = require('../middleware/auth.middleare.js')


const router = express.Router();

// GET results for a poll (or overall)
router.get("/analysis",protect, getResults);
router.get('/:pollId', protect, getPollResults);
module.exports = router;   