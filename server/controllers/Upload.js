import multer from "multer";
import path from "path";
import { responder } from "../utils/utils.js";

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "../uploads",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|avif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true);
    } else {
      cb("Error: Only JPG, PNG, and GIF files are allowed!");
    }
  },
});

// Controller for handling image uploads
export const uploadImage = (req, res) => {
  if (!req.file) {
    return responder(res, false, "No file uploaded", null, 400);
  }
  return responder(res, true, "File uploaded successfully", { imageUrl: `/uploads/${req.file.filename}` });
};

export const uploadMiddleware = upload.single("image");
