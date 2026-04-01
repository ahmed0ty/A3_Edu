import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "instructor-requests",
      resource_type: "image",
      allowed_formats: ["jpg", "png", "jpeg"],
      timeout: 60000,
    };
  },
});

export const instructorUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});