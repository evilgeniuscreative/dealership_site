import express from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../services/database';
import { CarouselImage } from '../types';

const router = express.Router();

// Get all carousel images
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM carousel_images WHERE is_active = 1 ORDER BY display_order ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new carousel image
router.post('/', async (req, res) => {
  try {
    const image: CarouselImage = req.body;
    
    // Get the highest display_order
    const [orderResult] = await pool.execute<RowDataPacket[]>(
      'SELECT MAX(display_order) as maxOrder FROM carousel_images'
    );
    const nextOrder = (orderResult[0].maxOrder || 0) + 1;

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO carousel_images (
        image_url, title, subtitle, delay, display_order, is_active
      ) VALUES (?, ?, ?, ?, ?, 1)`,
      [
        image.imageUrl,
        image.title,
        image.subtitle,
        image.delay || 7000,
        nextOrder
      ]
    );

    res.status(201).json({
      id: result.insertId,
      ...image,
      display_order: nextOrder
    });
  } catch (error) {
    console.error('Error creating carousel image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a carousel image
router.put('/:id', async (req, res) => {
  try {
    const image: CarouselImage = req.body;
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE carousel_images SET
        image_url = ?, title = ?, subtitle = ?, delay = ?
      WHERE id = ?`,
      [
        image.imageUrl,
        image.title,
        image.subtitle,
        image.delay || 7000,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Carousel image not found' });
    }

    res.json({
      id: parseInt(req.params.id),
      ...image
    });
  } catch (error) {
    console.error('Error updating carousel image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a carousel image
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM carousel_images WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Carousel image not found' });
    }

    // Reorder remaining images
    await pool.execute(
      `UPDATE carousel_images 
       SET display_order = display_order - 1 
       WHERE display_order > (
         SELECT display_order FROM (
           SELECT display_order FROM carousel_images WHERE id = ?
         ) as subquery
       )`,
      [req.params.id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting carousel image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update carousel image order
router.put('/:id/order', async (req, res) => {
  try {
    const { newOrder } = req.body;
    const [currentImage] = await pool.execute<RowDataPacket[]>(
      'SELECT display_order FROM carousel_images WHERE id = ?',
      [req.params.id]
    );

    if (currentImage.length === 0) {
      return res.status(404).json({ error: 'Carousel image not found' });
    }

    const currentOrder = currentImage[0].display_order;

    if (newOrder > currentOrder) {
      await pool.execute(
        `UPDATE carousel_images 
         SET display_order = display_order - 1 
         WHERE display_order > ? AND display_order <= ?`,
        [currentOrder, newOrder]
      );
    } else {
      await pool.execute(
        `UPDATE carousel_images 
         SET display_order = display_order + 1 
         WHERE display_order >= ? AND display_order < ?`,
        [newOrder, currentOrder]
      );
    }

    await pool.execute(
      'UPDATE carousel_images SET display_order = ? WHERE id = ?',
      [newOrder, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating carousel order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
