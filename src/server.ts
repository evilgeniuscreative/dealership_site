import express from 'express';
import cors from 'cors';
import path from 'path';
import { authMiddleware } from './middleware/auth';
import carsRouter from './api/cars';
import carouselRouter from './api/carousel';
import uploadRouter from './api/upload';
import authRouter from './api/auth';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Set up trust proxy for rate limiting
app.set('trust proxy', 1);

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/cars', authMiddleware, carsRouter);
app.use('/api/carousel-images', authMiddleware, carouselRouter);
app.use('/api/upload', authMiddleware, uploadRouter);

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Implement error reporting service here if needed
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Implement error reporting service here if needed
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
