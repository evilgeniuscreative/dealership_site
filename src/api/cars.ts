import express, { Request, Response, RequestHandler } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../services/database';
import { Car, SearchFilters } from '../types';
import { authMiddleware } from '../middleware/auth';
import { getVisitorId } from '../utils/visitorUtils';
import { CarRandomizationService } from '../services/carRandomizationService';
import cookieParser from 'cookie-parser';

const router = express.Router();

// Add cookie parser middleware to access cookies
router.use(cookieParser());

// Define a type for the request handler with ID parameter
type IdRequestHandler = (req: Request<{ id: string }>, res: Response) => Promise<void | Response>;

// Public routes
// Get all cars with pagination and filters
router.get('/', ((req: Request, res: Response, next) => {
  (async () => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const offset = (page - 1) * limit;
      
      // Build the base query with randomization
      let query = 'SELECT * FROM cars WHERE 1=1';
      const params: any[] = [];

      // Add text search if query parameter exists
      if (req.query.query) {
        const searchTerm = `%${req.query.query}%`;
        const searchWords = (req.query.query as string).split(/\s+/).filter(word => word.length > 0);
        
        // Start building the search condition
        query += ' AND (';
        
        // Basic LIKE search for partial matches in any field
        const likeConditions = [
          'make LIKE ?',
          'model LIKE ?',
          'title LIKE ?',
          'body_text LIKE ?',
          'color LIKE ?'
        ];
        
        query += likeConditions.join(' OR ');
        
        // Add word boundary search for make, model, and title
        query += ' OR CONCAT(\' \', make, \' \') LIKE ?';
        query += ' OR CONCAT(\' \', model, \' \') LIKE ?';
        query += ' OR CONCAT(\' \', title, \' \') LIKE ?';
        
        // Add individual word search for multi-word queries
        if (searchWords.length > 1) {
          searchWords.forEach(word => {
            if (word.length > 2) { // Only search for words with at least 3 characters
              const wordTerm = `%${word}%`;
              query += ' OR make LIKE ?';
              query += ' OR model LIKE ?';
              query += ' OR title LIKE ?';
              params.push(wordTerm, wordTerm, wordTerm);
            }
          });
        }
        
        query += ')';
        
        // Word boundary simulation using CONCAT and spaces
        const wordBoundaryTerm = `% ${req.query.query} %`;
        
        params.push(
          searchTerm,       // make LIKE
          searchTerm,       // model LIKE
          searchTerm,       // title LIKE
          searchTerm,       // body_text LIKE
          searchTerm,       // color LIKE
          wordBoundaryTerm, // CONCAT(' ', make, ' ') LIKE
          wordBoundaryTerm, // CONCAT(' ', model, ' ') LIKE
          wordBoundaryTerm  // CONCAT(' ', title, ' ') LIKE
        );
      }

      // Add filters if they exist
      if (req.query.make) {
        query += ' AND make LIKE ?';
        params.push(`%${req.query.make}%`);
      }

      if (req.query.model) {
        query += ' AND model LIKE ?';
        params.push(`%${req.query.model}%`);
      }
      
      // Price range filters
      if (req.query.minPrice) {
        query += ' AND price >= ?';
        params.push(parseInt(req.query.minPrice as string));
      }
      
      if (req.query.maxPrice) {
        query += ' AND price <= ?';
        params.push(parseInt(req.query.maxPrice as string));
      }
      
      // Year range filters
      if (req.query.minYear) {
        query += ' AND model_year >= ?';
        params.push(parseInt(req.query.minYear as string));
      }
      
      if (req.query.maxYear) {
        query += ' AND model_year <= ?';
        params.push(parseInt(req.query.maxYear as string));
      }
      
      // Mileage filter
      if (req.query.maxMileage) {
        query += ' AND mileage <= ?';
        params.push(parseInt(req.query.maxMileage as string));
      }
      
      // Color filter
      if (req.query.color) {
        query += ' AND color LIKE ?';
        params.push(`%${req.query.color}%`);
      }
      
      // AWD filter
      if (req.query.isAWD) {
        query += ' AND car_type = ?';
        params.push('AWD');
      }

      if (req.query.featured_car) {
        query += ' AND featured_car = ?';
        params.push(req.query.featured_car === 'true' ? 1 : 0);
      }
      
      // Use MySQL's RAND() function to completely randomize the order on each request
      query += ' ORDER BY RAND()';
      
      // Add pagination
      query += ` LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
      console.log('Final query:', query);

      const [rows] = await pool.execute<RowDataPacket[]>(query, params);
      console.log(`Found ${rows.length} cars for page ${page}`);
      
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
        `SELECT * FROM cars 
         WHERE featured_car = 1
         ORDER BY id ASC`
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
router.post('/', authMiddleware, ((req: Request, res: Response, next) => {
  (async () => {
    try {
      const car: Car = req.body;
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO cars (
          make, model, model_year, color, doors,
          engine_size, horsepower, mileage,
          price, title, body_text, image_name,
          car_condition, car_status, car_transmission, car_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          car.make,
          car.model,
          car.model_year,
          car.color,
          car.doors,
          car.engine_size,
          car.horsepower,
          car.mileage,
          car.price,
          car.title,
          car.body_text,
          car.image_name,
          car.car_condition || null,
          car.car_status || null,
          car.car_transmission || null,
          car.car_type || null
        ]
      );

      const newCarId = result.insertId;
      
      // Add the new car ID to the cars_array
      await CarRandomizationService.addCarToArray(newCarId);
      
      res.status(201).json({
        id: newCarId,
        ...car
      });
    } catch (error) {
      console.error('Error creating car:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  })();
}) as RequestHandler);

// Update a car
router.put('/:id', authMiddleware, ((req: Request<{ id: string }>, res: Response, next) => {
  (async () => {
    try {
      const car: Car = req.body;
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE cars SET
          make = ?, model = ?, model_year = ?, color = ?, doors = ?,
          engine_size = ?, horsepower = ?, mileage = ?,
          price = ?, title = ?, body_text = ?, image_name = ?,
          car_condition = ?, car_status = ?, car_transmission = ?, car_type = ?
        WHERE id = ?`,
        [
          car.make,
          car.model,
          car.model_year,
          car.color,
          car.doors,
          car.engine_size,
          car.horsepower,
          car.mileage,
          car.price,
          car.title,
          car.body_text,
          car.image_name,
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
