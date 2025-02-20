import express, { Request, Response, Router } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../services/database';
import { CarouselImage } from '../types';
import { authMiddleware } from '../middleware/auth';

const router: Router = express.Router();

// Get all carousel images
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM carousel_images ORDER BY display_order ASC');
    res.json(rows as CarouselImage[]);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ error: 'Failed to fetch carousel images' });
  }
});

// Create a new carousel image
router.post('/', authMiddleware, async (req: Request<{}, {}, CarouselImage>, res: Response) => {
  try {
    const image: CarouselImage = req.body;
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO carousel_images (title, subtitle, image_url, display_order) VALUES (?, ?, ?, ?)',
      [image.title, image.subtitle, image.imageUrl, image.displayOrder]
    );

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
router.put('/:id', authMiddleware, async (req: Request<{ id: string }, {}, CarouselImage>, res: Response) => {
  try {
    const image: CarouselImage = req.body;
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE carousel_images SET title = ?, subtitle = ?, image_url = ?, display_order = ? WHERE id = ?',
      [image.title, image.subtitle, image.imageUrl, image.displayOrder, req.params.id]
    );

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
