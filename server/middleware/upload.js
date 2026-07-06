import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new ApiError(400, 'Only image files are allowed.'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

// Converts a multer memory buffer into a base64 data URI Cloudinary can ingest
export const bufferToDataUri = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
