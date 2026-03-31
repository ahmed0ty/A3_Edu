import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "instructor-requests", // ✅ منفصل عن الدروس
      resource_type: "image",
      allowed_formats: ["jpg", "png", "jpeg"],
    };
  },
});

export const instructorUpload = multer({ storage });