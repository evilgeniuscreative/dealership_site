import express, { Request, Response, RequestHandler } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../services/database';
import { Car, SearchFilters } from '../types';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Define a type for the request handler with ID parameter
type IdRequestHandler = (req: Request<{ id: string }>, res: Response) => Promise<void | Response>;

// Public routes
// Get all cars with pagination and filters
router.get('/', ((req: Request<{}, {}, {}, SearchFilters>, res: Response, next) => {
  (async () => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM cars WHERE 1=1';
      const params: any[] = [];

      // Add filters if they exist
      if (req.query.make) {
        query += ' AND make = ?';
        params.push(req.query.make);
      }

      if (req.query.model) {
        query += ' AND model = ?';
        params.push(req.query.model);
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

      // Add pagination - use direct values for LIMIT and OFFSET
      query += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

      const [rows] = await pool.execute<RowDataPacket[]>(query, params);
      res.json(rows as Car[]);
    } catch (error) {
      console.error('Error fetching cars:', error);
      res.status(500).json({ error: 'Failed to fetch cars' });
    }
  })();
}) as RequestHandler);

// Get featured cars - this MUST come before /:id route to avoid conflict
router.get('/featured', ((req: Request, res: Response, next) => {
  (async () => {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT c.* FROM cars c
         INNER JOIN carousel_images ci ON c.id = ci.car_id
         WHERE ci.carousel_type = 'featured'
         ORDER BY ci.display_order ASC`
      );
      
      res.json(rows as Car[]);
    } catch (error) {
      console.error('Error fetching featured cars:', error);
      res.status(500).json({ error: 'Failed to fetch featured cars' });
    }
  })();
}) as RequestHandler);

// Get a single car by ID - this must come AFTER any specific routes like /featured
router.get('/:id', ((req: Request<{ id: string }>, res: Response, next) => {
  (async () => {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM cars WHERE id = ?',
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Car not found' });
      }

      res.json(rows[0] as Car);
    } catch (error) {
      console.error('Error fetching car:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  })();
}) as RequestHandler);

// Protected routes
// Create a new car
router.post('/', authMiddleware, ((req: Request<{}, {}, Car>, res: Response, next) => {
  (async () => {
    try {
      const car: Car = req.body;
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO cars (
          make, model, modelYear, color, doors,
          engine_size, horsepower, mileage,
          price, title, bodyText, imageName,
          car_condition, car_status, car_transmission, car_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          car.make,
          car.model,
          car.modelYear,
          car.color,
          car.doors,
          car.engine_size,
          car.horsepower,
          car.mileage,
          car.price,
          car.title,
          car.bodyText,
          car.imageName,
          car.car_condition || null,
          car.car_status || null,
          car.car_transmission || null,
          car.car_type || null
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
  })();
}) as RequestHandler);

// Update a car
router.put('/:id', authMiddleware, ((req: Request<{ id: string }, {}, Car>, res: Response, next) => {
  (async () => {
    try {
      const car: Car = req.body;
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE cars SET
          make = ?, model = ?, modelYear = ?, color = ?, doors = ?,
          engine_size = ?, horsepower = ?, mileage = ?,
          price = ?, title = ?, bodyText = ?, imageName = ?,
          car_condition = ?, car_status = ?, car_transmission = ?, car_type = ?
        WHERE id = ?`,
        [
          car.make,
          car.model,
          car.modelYear,
          car.color,
          car.doors,
          car.engine_size,
          car.horsepower,
          car.mileage,
          car.price,
          car.title,
          car.bodyText,
          car.imageName,
          car.car_condition || null,
          car.car_status || null,
          car.car_transmission || null,
          car.car_type || null,
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
  })();
}) as RequestHandler);

// Delete a car
router.delete('/:id', authMiddleware, ((req: Request<{ id: string }>, res: Response, next) => {
  (async () => {
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
  })();
}) as RequestHandler);

export default router;
