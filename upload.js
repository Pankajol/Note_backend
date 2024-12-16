const multer = require('multer');
const cloudinary = require('./cloudinary');

const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,

  params: async (req, file) => {
    let resourceType = 'auto'; // Let Cloudinary auto-detect the type (image, video, raw)
    if (file.mimetype.includes('video')) {
      resourceType = 'video';
    } else if (file.mimetype.includes('application')) {
      resourceType = 'raw'; // For PDFs and other documents
    } else if (file.mimetype.includes('image')) {
      resourceType = 'image';
    }
    return {
      folder: 'notes_uploads', // Folder in Cloudinary
      resource_type: resourceType, // Set resource type based on file
      allowed_formats: ['jpg', 'png', 'mp4', 'avi', 'pdf'], // Allowed file formats
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
