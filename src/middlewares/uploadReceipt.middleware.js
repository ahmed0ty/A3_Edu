import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";

    return {
      folder: "receipts", // 👈 خليه receipts مش lessons
      resource_type: isPdf ? "raw" : "image", // 👈 مهم
      format: undefined, // 👈 سيب Cloudinary يحددها
    };
  },
});

export const uploadReceipt = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});