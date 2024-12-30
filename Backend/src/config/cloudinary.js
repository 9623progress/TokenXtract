import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRETE_KEY,
});

// Configure Multer-Storage-Cloudinary
export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "government_fund_distribution", // Folder name in Cloudinary
    allowed_formats: ["jpeg", "png", "jpg", "gif", "pdf"], // Allowed file formats
  },
});

export default cloudinary;
