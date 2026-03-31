import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";

    return {
      
      folder: "lessons",
      resource_type: isPdf ? "raw" : "auto", // 🔥 مهم جدًا
      allowed_formats: ["mp4", "pdf", "jpg", "png"],
    };
  },
});

export const upload = multer({ storage });