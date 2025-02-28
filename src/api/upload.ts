import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import csv from 'csv-parse';
import pool from '../services/database';
import { Car } from '../types';

const router: Router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Create uploads directory
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const uploadMulter = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Process CSV and import cars
async function processCarsCSV(filePath: string): Promise<{ success: number; failed: number; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const results: Car[] = [];
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    fs.createReadStream(filePath)
      .pipe(csv.parse({ columns: true, trim: true }))
      .on('data', (data: any) => {
        // Convert numeric fields
        data.year = parseInt(data.year);
        data.doors = parseInt(data.doors);
        data.horsepower = parseInt(data.horsepower);
        data.mileage = parseInt(data.mileage);
        data.price = parseInt(data.price);
        results.push(data as Car);
      })
      .on('end', async () => {
        // Process each car
        for (const car of results) {
          try {
            await pool.execute(
              'INSERT INTO cars (make, model, year, color, doors, engine_displacement, horsepower, mileage, price, summary, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                car.make,
                car.model,
                car.year,
                car.color,
                car.doors,
                car.engineDisplacement,
                car.horsepower,
                car.mileage,
                car.price,
                car.summary,
                car.description,
                car.imageUrl
              ]
            );
            success++;
          } catch (error) {
            failed++;
            errors.push(`Failed to import ${car.make} ${car.model}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
        resolve({ success, failed, errors });
      })
      .on('error', (error: Error) => {
        reject(error);
      });
  });
}

// Upload endpoint
router.post('/', authMiddleware, upload.array('files'), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const results = [];

    for (const file of files) {
      const originalName = file.originalname;
      const extension = path.extname(originalName).toLowerCase();
      
      if (extension === '.csv') {
        // Process CSV file
        try {
          const csvResults = await processCarsCSV(file.path);
          results.push({
            originalName,
            type: 'csv',
            ...csvResults
          });
        } catch (error) {
          results.push({
            originalName,
            type: 'csv',
            error: `Failed to process CSV: ${error instanceof Error ? error.message : String(error)}`
          });
        }
      } else {
        // Handle regular file upload
        const newFileName = `${uuidv4()}${extension}`;
        const targetPath = path.join('uploads', newFileName);
        
        fs.renameSync(file.path, targetPath);
        
        await pool.execute(
          'INSERT INTO uploaded_files (original_name, file_name, mime_type, size) VALUES (?, ?, ?, ?)',
          [originalName, newFileName, file.mimetype, file.size]
        );

        results.push({
          originalName,
          type: 'file',
          success: true
        });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

// Handle file upload
router.post('/image', uploadMulter.single('image'), function(req, res) {
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
