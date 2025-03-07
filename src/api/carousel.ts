import express, { Request, Response, Router } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../services/database';
import { CarouselImage } from '../types';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Get all carousel images with optional type filter
router.get('/', async (req: Request, res: Response) => {
  try {
    const carouselType = req.query.type || 'main';
    
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM carousel_images WHERE carousel_type = ? ORDER BY display_order ASC',
      [carouselType]
    );
    
    res.json(rows as CarouselImage[]);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ error: 'Failed to fetch carousel images' });
  }
});

// Create a new carousel image
router.post('/', authMiddleware, async (req: Request<{}, {}, CarouselImage & { car_id?: number, carousel_type?: string }>, res: Response) => {
  try {
    const image = req.body;
    
    // SQL query depends on whether car_id is provided
    let query, params;
    
    if (image.car_id) {
      query = 'INSERT INTO carousel_images (car_id, title, subtitle, image_url, display_order, carousel_type) VALUES (?, ?, ?, ?, ?, ?)';
      params = [image.car_id, image.title, image.subtitle, image.imageUrl, image.displayOrder || 0, image.carousel_type || 'main'];
    } else {
      query = 'INSERT INTO carousel_images (title, subtitle, image_url, display_order, carousel_type) VALUES (?, ?, ?, ?, ?)';
      params = [image.title, image.subtitle, image.imageUrl, image.displayOrder || 0, image.carousel_type || 'main'];
    }

    const [result] = await pool.execute<ResultSetHeader>(query, params);

    const [newImage] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM carousel_images WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newImage[0] as CarouselImage);
  } catch (error) {
    console.error('Error creating carousel image:', error);
    res.status(500).json({ error: 'Failed to create carousel image' });
  }
});

// Update a carousel image
router.put('/:id', authMiddleware, async (req: Request<{ id: string }, {}, CarouselImage & { car_id?: number, carousel_type?: string }>, res: Response) => {
  try {
    const image = req.body;
    
    // SQL query depends on whether car_id is provided
    let query, params;
    
    if (image.car_id) {
      query = 'UPDATE carousel_images SET car_id = ?, title = ?, subtitle = ?, image_url = ?, display_order = ?, carousel_type = ? WHERE id = ?';
      params = [image.car_id, image.title, image.subtitle, image.imageUrl, image.displayOrder || 0, image.carousel_type || 'main', req.params.id];
    } else {
      query = 'UPDATE carousel_images SET car_id = NULL, title = ?, subtitle = ?, image_url = ?, display_order = ?, carousel_type = ? WHERE id = ?';
      params = [image.title, image.subtitle, image.imageUrl, image.displayOrder || 0, image.carousel_type || 'main', req.params.id];
    }

    const [result] = await pool.execute<ResultSetHeader>(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Carousel image not found' });
    }

    const [updatedImage] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM carousel_images WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedImage[0] as CarouselImage);
  } catch (error) {
    console.error('Error updating carousel image:', error);
    res.status(500).json({ error: 'Failed to update carousel image' });
  }
});

// Delete a carousel image
router.delete('/:id', authMiddleware, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM carousel_images WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Carousel image not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting carousel image:', error);
    res.status(500).json({ error: 'Failed to delete carousel image' });
  }
});

export default router;
