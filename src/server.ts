import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { RowDataPacket } from 'mysql2';
import { User, UserResponse } from './types';
import pool from './services/database';
import { authMiddleware } from './middleware/auth';
import carsRouter from './api/cars';
import carouselRouter from './api/carousel';
import uploadRouter from './api/upload';
import authRouter from './api/auth';

// Type declarations for express-session
declare module 'express-session' {
  interface SessionData {
    passport: { user: number };
  }
}

// Extend Express User interface
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      role: string;
      two_factor_enabled: boolean;
      google_id?: string;
      created_at: Date;
      updated_at: Date;
      last_login?: Date;
    }
  }
}

const app = express();
const port = process.env.PORT || 3002;

// Middleware setup
const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};

// Apply core middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
const staticPath = path.join(__dirname, '../public');
app.use(express.static(staticPath));

// Set up trust proxy for rate limiting
app.set('trust proxy', 1);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }) as RequestHandler
);

// Passport configuration
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        id, username, email, role, two_factor_enabled, 
        google_id, created_at, updated_at, last_login 
       FROM users WHERE id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return done(null, null);
    }

    const user: Express.User = {
      id: rows[0].id,
      username: rows[0].username,
      email: rows[0].email,
      role: rows[0].role,
      two_factor_enabled: rows[0].two_factor_enabled,
      google_id: rows[0].google_id,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
      last_login: rows[0].last_login
    };

    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Configure Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE google_id = ?',
            [profile.id]
          );

          if (rows.length > 0) {
            const user: Express.User = {
              id: rows[0].id,
              username: rows[0].username,
              email: rows[0].email,
              role: rows[0].role,
              two_factor_enabled: rows[0].two_factor_enabled,
              google_id: rows[0].google_id,
              created_at: rows[0].created_at,
              updated_at: rows[0].updated_at,
              last_login: rows[0].last_login
            };
            return done(null, user);
          }

          const [result] = await pool.execute(
            `INSERT INTO users (
              username,
              email,
              google_id,
              google_profile,
              role,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, 'user', NOW(), NOW())`,
            [
              profile.displayName,
              profile.emails?.[0]?.value || '',
              profile.id,
              JSON.stringify(profile)
            ]
          );

          const [newUser] = await pool.execute<RowDataPacket[]>(
            `SELECT 
              id, username, email, role, two_factor_enabled,
              google_id, created_at, updated_at, last_login 
             FROM users WHERE id = ?`,
            [(result as any).insertId]
          );

          const user: Express.User = {
            id: newUser[0].id,
            username: newUser[0].username,
            email: newUser[0].email,
            role: newUser[0].role,
            two_factor_enabled: newUser[0].two_factor_enabled,
            google_id: newUser[0].google_id,
            created_at: newUser[0].created_at,
            updated_at: newUser[0].updated_at,
            last_login: newUser[0].last_login
          };

          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
}

// Initialize passport after configuration
app.use(passport.initialize());
app.use(passport.session());

// API Routes setup
app.use('/api/auth', authRouter);
app.use('/api/cars', carsRouter);
app.use('/api/carousel-images', carouselRouter);
app.use('/api/upload', uploadRouter);

// HTML Routes
app.get('/cars', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/cars.html'));
});

app.get('/carousel-images', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/carousel-images.html'));
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/upload.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/auth.html'));
});

// Serve React app for all other routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
