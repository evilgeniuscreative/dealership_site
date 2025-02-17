import { RowDataPacket } from 'mysql2';
import pool from './database';
import { sendEmail } from './email';
import { getAccountLinkingTemplate } from './emailTemplates';

interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{ value: string }>;
}

export const findOrCreateUser = async (profile: GoogleProfile) => {
  const email = profile.emails[0]?.value;
  
  if (!email) {
    throw new Error('Email is required from Google profile');
  }

  try {
    // Check if user exists with this email or Google ID
    const [existingUsers] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? OR google_id = ?',
      [email, profile.id]
    );

    if (existingUsers.length > 0) {
      const user = existingUsers[0];

      // If user exists but Google ID is not linked, link it
      if (!user.google_id) {
        await linkGoogleAccount(user.id, profile);
        return user;
      }

      return user;
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
        profile.displayName || email.split('@')[0],
        email,
        profile.id,
        JSON.stringify(profile)
      ]
    );

    const [newUser] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [(result as any).insertId]
    );

    return newUser[0];
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

export const linkGoogleAccount = async (userId: number, profile: GoogleProfile) => {
  try {
    // Update user with Google information
    await pool.execute(
      `UPDATE users 
       SET google_id = ?,
           google_profile = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [profile.id, JSON.stringify(profile), userId]
    );

    // Get updated user information
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    const user = rows[0];

    // Send account linking email
    await sendEmail(
      user.email,
      'Account Linked Successfully',
      getAccountLinkingTemplate({
        username: user.username
      })
    );

    return user;
  } catch (error) {
    console.error('Error linking Google account:', error);
    throw error;
  }
};

export const unlinkGoogleAccount = async (userId: number) => {
  try {
    // Verify user has password before unlinking
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!rows[0].password_hash) {
      throw new Error('Cannot unlink Google account without setting a password first');
    }

    // Remove Google information
    await pool.execute(
      `UPDATE users 
       SET google_id = NULL,
           google_profile = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [userId]
    );

    return true;
  } catch (error) {
    console.error('Error unlinking Google account:', error);
    throw error;
  }
};
