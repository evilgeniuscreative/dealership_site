import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';
import pool from '../services/database';
import { generateToken, authMiddleware } from '../middleware/auth';
import { sendPasswordResetEmail, send2FASetupEmail, sendLoginAlertEmail } from '../services/email';
import { generateSecret, generateQRCode, verifyToken, generateBackupCodes, hashBackupCode } from '../services/twoFactor';

const router = express.Router();

interface LoginAttempt {
  username: string;
  ip_address: string;
  success: boolean;
}

const recordLoginAttempt = async (attempt: LoginAttempt) => {
  try {
    await pool.execute(
      'INSERT INTO login_attempts (username, ip_address, success) VALUES (?, ?, ?)',
      [attempt.username, attempt.ip_address, attempt.success]
    );
  } catch (error) {
    console.error('Error recording login attempt:', error);
  }
};

const checkLoginAttempts = async (username: string, ip_address: string): Promise<boolean> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM login_attempts 
       WHERE username = ? 
       AND ip_address = ? 
       AND success = false 
       AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)`,
      [username, ip_address]
    );

    return rows[0].count < 5;
  } catch (error) {
    console.error('Error checking login attempts:', error);
    return false;
  }
};

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password, twoFactorToken } = req.body;
  const ip_address = req.ip;

  try {
    const canAttempt = await checkLoginAttempts(username, ip_address);
    if (!canAttempt) {
      await recordLoginAttempt({ username, ip_address, success: false });
      return res.status(429).json({
        error: 'Too many failed login attempts. Please try again later.'
      });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ? AND is_active = true',
      [username]
    );

    if (rows.length === 0) {
      await recordLoginAttempt({ username, ip_address, success: false });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      await recordLoginAttempt({ username, ip_address, success: false });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check 2FA if enabled
    if (user.two_factor_enabled) {
      if (!twoFactorToken) {
        return res.status(200).json({
          requiresTwoFactor: true,
          message: 'Please enter your 2FA code'
        });
      }

      const isValidToken = verifyToken(user.two_factor_secret, twoFactorToken);
      if (!isValidToken) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
    }

    const accessToken = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    const refreshToken = generateToken({
      id: user.id,
      username: user.username,
      type: 'refresh'
    });

    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [user.id, refreshToken]
    );

    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    await recordLoginAttempt({ username, ip_address, success: true });

    // Send login alert email
    await sendLoginAlertEmail(
      user.email,
      ip_address,
      req.headers['user-agent'] || 'Unknown',
      'Unknown Location' // You can integrate with a geolocation service here
    );

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.two_factor_enabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Setup 2FA
router.post('/2fa/setup', authMiddleware, async (req, res) => {
  try {
    const secret = generateSecret();
    const qrCodeUrl = await generateQRCode(secret.base32);
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    // Store the secret temporarily (you might want to use Redis for this)
    // For now, we'll update the user directly
    await pool.execute(
      'UPDATE users SET two_factor_secret = ? WHERE id = ?',
      [secret.base32, req.user.id]
    );

    // Send setup email with QR code and backup codes
    await send2FASetupEmail(req.user.email, qrCodeUrl, backupCodes);

    res.json({
      secret: secret.base32,
      qrCodeUrl,
      backupCodes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify and enable 2FA
router.post('/2fa/enable', authMiddleware, async (req, res) => {
  const { token } = req.body;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT two_factor_secret FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0 || !rows[0].two_factor_secret) {
      return res.status(400).json({ error: '2FA not set up' });
    }

    const isValidToken = verifyToken(rows[0].two_factor_secret, token);
    if (!isValidToken) {
      return res.status(401).json({ error: 'Invalid 2FA code' });
    }

    await pool.execute(
      'UPDATE users SET two_factor_enabled = true WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
router.post('/password/reset-request', async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND is_active = true',
      [email]
    );

    if (rows.length === 0) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link will be sent' });
    }

    const user = rows[0];
    const token = crypto.randomBytes(32).toString('hex');

    await pool.execute(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))`,
      [user.id, token]
    );

    await sendPasswordResetEmail(email, token);

    res.json({ message: 'If the email exists, a reset link will be sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/password/reset', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const [tokens] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM password_reset_tokens 
       WHERE token = ? 
       AND expires_at > NOW() 
       AND used_at IS NULL`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const resetToken = tokens[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password and mark token as used
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, resetToken.user_id]
    );

    await pool.execute(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?',
      [resetToken.id]
    );

    // Revoke all refresh tokens for this user
    await pool.execute(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ?',
      [resetToken.user_id]
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const [tokens] = await pool.execute<RowDataPacket[]>(
      `SELECT rt.*, u.username, u.role 
       FROM refresh_tokens rt 
       JOIN users u ON rt.user_id = u.id 
       WHERE rt.token = ? 
       AND rt.expires_at > NOW() 
       AND rt.revoked_at IS NULL`,
      [refreshToken]
    );

    if (tokens.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const token = tokens[0];

    const accessToken = generateToken({
      id: token.user_id,
      username: token.username,
      role: token.role
    });

    res.json({ token: accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    await pool.execute(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ?',
      [refreshToken]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
