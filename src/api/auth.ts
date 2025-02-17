import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import passport from 'passport';
import { RowDataPacket } from 'mysql2';
import pool from '../services/database';
import { authMiddleware } from '../middleware/auth';
import {
  initiateRecovery,
  validateRecoveryToken,
  resetPassword,
  generateBackupCodes,
  validateBackupCode
} from '../services/recovery';
import {
  generateToken,
  validateTwoFactorToken,
  generateTOTPSecret,
  generateTOTPUri,
  verifyTOTPToken,
  generateRefreshToken,
  hashToken
} from '../services/token';
import {
  linkGoogleAccount,
  unlinkGoogleAccount,
  findUserByGoogleId,
  createUserFromGoogleProfile
} from '../services/google';
import {
  LoginRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  TwoFactorSetupRequest,
  GoogleLinkRequest,
  User,
  AuthResponse,
  AuthRequest,
  UserResponse,
  AuthenticatedUser
} from '../types';

const router = express.Router();

// Rate limiting setup
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface LoginAttempt {
  username: string;
  ip_address: string;
  success: boolean;
}

const recordLoginAttempt = async (attempt: LoginAttempt): Promise<void> => {
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
       AND attempted_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [username, ip_address, LOCKOUT_DURATION / (60 * 1000)]
    );

    return rows[0].count < MAX_LOGIN_ATTEMPTS;
  } catch (error) {
    console.error('Error checking login attempts:', error);
    return false;
  }
};

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password, twoFactorToken } = req.body as LoginRequest;
    const ip_address = req.ip || '0.0.0.0';

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check for too many failed attempts
    const canAttempt = await checkLoginAttempts(username, ip_address);
    if (!canAttempt) {
      return res.status(429).json({ error: 'Too many failed attempts. Please try again later.' });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      await recordLoginAttempt({ username, ip_address, success: false });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0] as User;
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      await recordLoginAttempt({ username, ip_address, success: false });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Handle 2FA if enabled
    if (user.two_factor_enabled) {
      if (!twoFactorToken) {
        return res.status(400).json({ error: '2FA token required' });
      }

      const isValidToken = verifyTOTPToken(twoFactorToken, user.two_factor_secret || '');
      if (!isValidToken) {
        await recordLoginAttempt({ username, ip_address, success: false });
        return res.status(401).json({ error: 'Invalid 2FA token' });
      }
    }

    // Create AuthenticatedUser from database User
    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    // Generate tokens
    const token = generateToken(authenticatedUser);
    const refreshToken = await generateRefreshToken(user.id);

    // Record successful login
    await recordLoginAttempt({ username, ip_address, success: true });
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const userResponse: UserResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.two_factor_enabled
    };

    const response: AuthResponse = {
      token,
      refreshToken,
      user: userResponse
    };

    return res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Revoke the refresh token
    await pool.execute(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ? AND user_id = ?',
      [hashToken(refreshToken), req.user?.id]
    );

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset endpoints
router.post('/forgot-password', async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await initiateRecovery(email);
    return res.json({ message: 'Recovery email sent if account exists' });
  } catch (error) {
    console.error('Password recovery error:', error);
    return res.status(500).json({ error: 'Failed to process recovery request' });
  }
});

router.post('/validate-reset-token', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const isValid = await validateRecoveryToken(token);
    return res.json({ valid: isValid });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ error: 'Failed to validate token' });
  }
});

router.post('/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { token, newPassword } = req.body as ResetPasswordRequest;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    await resetPassword(token, newPassword);
    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// 2FA endpoints
router.post('/2fa/setup', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const secret = generateTOTPSecret();
    const uri = generateTOTPUri(secret, authReq.user.username);
    const backupCodes = await generateBackupCodes(authReq.user.id);

    await pool.execute(
      'UPDATE users SET two_factor_secret = ? WHERE id = ?',
      [secret, authReq.user.id]
    );

    return res.json({
      secret,
      uri,
      backupCodes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

router.post('/2fa/verify', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { token } = req.body as TwoFactorSetupRequest;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT two_factor_secret FROM users WHERE id = ?',
      [authReq.user.id]
    );

    if (rows.length === 0 || !rows[0].two_factor_secret) {
      return res.status(400).json({ error: '2FA not set up' });
    }

    const isValidToken = verifyTOTPToken(token, rows[0].two_factor_secret);
    if (!isValidToken) {
      return res.status(401).json({ error: 'Invalid 2FA code' });
    }

    await pool.execute(
      'UPDATE users SET two_factor_enabled = true WHERE id = ?',
      [authReq.user.id]
    );

    return res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({ error: 'Failed to verify 2FA' });
  }
});

router.post('/2fa/disable', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await pool.execute(
      'UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE id = ?',
      [authReq.user.id]
    );

    return res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    return res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

// Google OAuth endpoints
router.post('/link/google', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const googleProfile = req.body as GoogleLinkRequest;
    await linkGoogleAccount(authReq.user.id, googleProfile);
    return res.json({ message: 'Google account linked successfully' });
  } catch (error) {
    console.error('Google link error:', error);
    return res.status(500).json({ error: 'Failed to link Google account' });
  }
});

router.post('/unlink/google', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await unlinkGoogleAccount(authReq.user.id);
    return res.json({ message: 'Google account unlinked successfully' });
  } catch (error) {
    console.error('Google unlink error:', error);
    return res.status(500).json({ error: 'Failed to unlink Google account' });
  }
});

export default router;
