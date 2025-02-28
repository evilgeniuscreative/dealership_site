import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { RowDataPacket } from 'mysql2';
import { User } from '../types';
import pool from '../services/database';

// Type for the user object we store in the session
declare global {
  namespace Express {
    // Define User interface explicitly instead of extending
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

// Serialize user for the session
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: number, done) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    const user = rows[0] as Express.User;
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        const [rows] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM users WHERE google_id = ?',
          [profile.id]
        );

        if (rows.length > 0) {
          return done(null, rows[0] as Express.User);
        }

        // Create new user if doesn't exist
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
          'SELECT * FROM users WHERE id = ?',
          [(result as any).insertId]
        );

        done(null, newUser[0] as Express.User);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);

export default passport;
