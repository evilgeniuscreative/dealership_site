import express from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../services/database';
import { Car } from '../types';

const router = express.Router();

// Get all cars with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM cars WHERE 1=1';
    const params: any[] = [];

    // Add filters if they exist
    if (req.query.make) {
      query += ' AND make LIKE ?';
      params.push(`%${req.query.make}%`);
    }
    if (req.query.model) {
      query += ' AND model LIKE ?';
      params.push(`%${req.query.model}%`);
    }
    if (req.query.minPrice) {
      query += ' AND price >= ?';
      params.push(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query += ' AND price <= ?';
      params.push(req.query.maxPrice);
    }
    if (req.query.maxMileage) {
      query += ' AND mileage <= ?';
      params.push(req.query.maxMileage);
    }

    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    const [countResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM cars',
      []
    );

    const total = countResult[0].total;
    const hasMore = offset + rows.length < total;

    res.json({
      cars: rows,
      hasMore,
      total
    });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single car by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM cars WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new car
router.post('/', async (req, res) => {
  try {
    const car: Car = req.body;
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO cars (
        make, model, year, color, doors, engine_displacement,
        horsepower, mileage, price, summary, description, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    res.status(201).json({
      id: result.insertId,
      ...car
    });
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a car
router.put('/:id', async (req, res) => {
  try {
    const car: Car = req.body;
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE cars SET
        make = ?, model = ?, year = ?, color = ?, doors = ?,
        engine_displacement = ?, horsepower = ?, mileage = ?,
        price = ?, summary = ?, description = ?, image_url = ?
      WHERE id = ?`,
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
        car.imageUrl,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json({
      id: parseInt(req.params.id),
      ...car
    });
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a car
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM cars WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
