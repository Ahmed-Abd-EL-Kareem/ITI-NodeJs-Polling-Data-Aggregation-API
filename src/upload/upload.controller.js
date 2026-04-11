const cloudinary = require("cloudinary").v2;
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

function ensureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  return true;
}

exports.uploadPollImage = catchAsync(async (req, res, next) => {
  if (!ensureCloudinary()) {
    return next(
      new AppError(
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .development.env",
        500
      )
    );
  }

  if (!req.file || !req.file.buffer) {
    return next(new AppError("No image file uploaded", 400));
  }

  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "polling-app/polls",
    resource_type: "image",
  });

  res.status(200).json({
    status: "success",
    data: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
});
