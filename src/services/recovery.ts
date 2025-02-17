import { RowDataPacket } from 'mysql2';
import pool from './database';
import { sendEmail } from './email';
import { getPasswordResetTemplate } from './emailTemplates';
import { generateToken, verifyToken } from './token';

interface RecoveryToken {
  userId: number;
  token: string;
  expiresAt: Date;
}

export const initiateRecovery = async (email: string): Promise<boolean> => {
  try {
    // Find user by email
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, username, email FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      // Return true even if user not found to prevent email enumeration
      return true;
    }

    const user = rows[0];
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store recovery token
    await pool.execute(
      `INSERT INTO recovery_tokens (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [user.id, token, expiresAt]
    );

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Send recovery email
    await sendEmail(
      user.email,
      'Password Reset Request',
      getPasswordResetTemplate({
        username: user.username,
        resetLink
      })
    );

    return true;
  } catch (error) {
    console.error('Recovery initiation error:', error);
    throw error;
  }
};

export const validateRecoveryToken = async (token: string): Promise<boolean> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM recovery_tokens 
       WHERE token = ? AND expires_at > NOW() AND used = FALSE`,
      [token]
    );

    return rows.length > 0;
  } catch (error) {
    console.error('Token validation error:', error);
    throw error;
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<boolean> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get token details
    const [tokens] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM recovery_tokens 
       WHERE token = ? AND expires_at > NOW() AND used = FALSE`,
      [token]
    );

    if (tokens.length === 0) {
      throw new Error('Invalid or expired token');
    }

    const recoveryToken = tokens[0];

    // Update password
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPassword, recoveryToken.user_id]
    );

    // Mark token as used
    await connection.execute(
      'UPDATE recovery_tokens SET used = TRUE WHERE id = ?',
      [recoveryToken.id]
    );

    // Get user details for notification
    const [users] = await connection.execute<RowDataPacket[]>(
      'SELECT email FROM users WHERE id = ?',
      [recoveryToken.user_id]
    );

    await connection.commit();

    // Send confirmation email
    await sendEmail(
      users[0].email,
      'Password Reset Successful',
      `Your password has been successfully reset. If you did not perform this action, please contact support immediately.`
    );

    return true;
  } catch (error) {
    await connection.rollback();
    console.error('Password reset error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const generateBackupCodes = async (userId: number): Promise<string[]> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Generate 10 backup codes
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );

    // Store hashed backup codes
    for (const code of codes) {
      await connection.execute(
        `INSERT INTO backup_codes (user_id, code_hash, used)
         VALUES (?, ?, FALSE)`,
        [userId, code] // In production, hash the code before storing
      );
    }

    await connection.commit();
    return codes;
  } catch (error) {
    await connection.rollback();
    console.error('Backup code generation error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const validateBackupCode = async (
  userId: number,
  code: string
): Promise<boolean> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Find and validate backup code
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM backup_codes 
       WHERE user_id = ? AND code_hash = ? AND used = FALSE`,
      [userId, code] // In production, hash the code before comparing
    );

    if (rows.length === 0) {
      return false;
    }

    // Mark code as used
    await connection.execute(
      'UPDATE backup_codes SET used = TRUE WHERE id = ?',
      [rows[0].id]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('Backup code validation error:', error);
    throw error;
  } finally {
    connection.release();
  }
};
