import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 or file-path image buffer to Cloudinary.
 * @param {string} filePathOrBase64
 * @param {string} folder
 */
export const uploadImage = async (filePathOrBase64, folder = 'cherryreddit') => {
  const result = await cloudinary.uploader.upload(filePathOrBase64, {
    folder,
    resource_type: 'image',
    transformation: [{ width: 1600, crop: 'limit' }, { quality: 'auto' }],
  });
  return { url: result.secure_url, publicId: result.public_id };
};

export const deleteImage = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId).catch(() => {});
};

export default cloudinary;
