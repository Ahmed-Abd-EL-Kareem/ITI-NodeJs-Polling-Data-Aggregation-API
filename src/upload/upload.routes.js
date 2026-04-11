const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth.middleware");
const { uploadPollImage } = require("./upload.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/image", protect, upload.single("file"), uploadPollImage);

module.exports = router;
