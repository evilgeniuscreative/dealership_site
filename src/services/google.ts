import { RowDataPacket } from 'mysql2';
import pool from './database';
import { GoogleLinkRequest, User } from '../types';

export const linkGoogleAccount = async (
  userId: number,
  googleProfile: GoogleLinkRequest['googleProfile']
): Promise<User> => {
  const [result] = await pool.execute(
    `UPDATE users 
     SET google_id = ?,
         google_profile = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [googleProfile.id, JSON.stringify(googleProfile), userId]
  );

  const [updatedUser] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  return updatedUser[0] as User;
};

export const unlinkGoogleAccount = async (userId: number): Promise<boolean> => {
  const [result] = await pool.execute(
    `UPDATE users 
     SET google_id = NULL,
         google_profile = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [userId]
  );

  return true;
};

export const findUserByGoogleId = async (
  googleId: string
): Promise<User | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM users WHERE google_id = ?',
    [googleId]
  );

  return rows.length > 0 ? (rows[0] as User) : null;
};

export const createUserFromGoogleProfile = async (
  profile: GoogleLinkRequest['googleProfile']
): Promise<User> => {
  const [result] = await pool.execute(
    `INSERT INTO users (
      username,
      email,
      google_id,
      google_profile,
      role,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      profile.email.split('@')[0], // Use email prefix as username
      profile.email,
      profile.id,
      JSON.stringify(profile)
    ]
  );

  const [newUser] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM users WHERE id = ?',
    [(result as any).insertId]
  );

  return newUser[0] as User;
};
