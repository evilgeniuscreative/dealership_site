import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { RowDataPacket } from 'mysql2';
import pool from '../services/database';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    done(null, rows[0] || null);
  } catch (error) {
    done(error, null);
  }
});

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
        // Check if user already exists
        const [existingUsers] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM users WHERE google_id = ? OR email = ?',
          [profile.id, profile.emails?.[0]?.value]
        );

        if (existingUsers.length > 0) {
          const user = existingUsers[0];
          
          // Update Google profile if needed
          if (user.google_id !== profile.id) {
            await pool.execute(
              'UPDATE users SET google_id = ?, google_profile = ? WHERE id = ?',
              [profile.id, JSON.stringify(profile), user.id]
            );
          }
          
          return done(null, user);
        }

        // Create new user
        const [result] = await pool.execute(
          `INSERT INTO users (
            username,
            email,
            google_id,
            google_profile,
            is_active,
            role
          ) VALUES (?, ?, ?, ?, true, 'admin')`,
          [
            profile.displayName || profile.emails?.[0]?.value?.split('@')[0],
            profile.emails?.[0]?.value,
            profile.id,
            JSON.stringify(profile)
          ]
        );

        const [newUser] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM users WHERE id = ?',
          [(result as any).insertId]
        );

        done(null, newUser[0]);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);

export default passport;
