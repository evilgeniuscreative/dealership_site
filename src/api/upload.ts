import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Create uploads directory
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Handle file upload
router.post('/', upload.single('image'), function(req, res) {
  if (!req.file) {
    return res.status(400).json({
      error: 'Missing file',
      message: 'Please provide an image file'
    });
  }

  // Validate file type
  const allowedTypes = /\.(jpg|jpeg|png|gif)$/i;
  if (!allowedTypes.test(req.file.originalname)) {
    // Remove the invalid file
    fs.unlinkSync(req.file.path);
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only image files (jpg, jpeg, png, gif) are allowed'
    });
  }

  return res.json({
    url: `/uploads/${req.file.filename}`
  });
});

export default router;
