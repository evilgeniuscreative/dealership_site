import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';

// JWT token generation and validation
export const generateToken = (payload: any): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '1d'
  });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
};

// 2FA token validation
export const validateTwoFactorToken = (token: string, secret: string): boolean => {
  try {
    return authenticator.verify({
      token,
      secret
    });
  } catch (error) {
    return false;
  }
};

// Generate random token for password reset, etc.
export const generateRandomToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate TOTP secret for 2FA
export const generateTOTPSecret = (): string => {
  return authenticator.generateSecret();
};

// Generate TOTP URI for QR code
export const generateTOTPUri = (
  username: string,
  secret: string,
  issuer: string = 'Dealership Admin'
): string => {
  return authenticator.keyuri(username, issuer, secret);
};

// Verify TOTP token
export const verifyTOTPToken = (token: string, secret: string): boolean => {
  try {
    return authenticator.verify({
      token,
      secret
    });
  } catch (error) {
    return false;
  }
};

// Generate refresh token
export const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

// Hash a token (for storing reset tokens, backup codes, etc.)
export const hashToken = (token: string): string => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

// Compare a plain token with its hashed version
export const compareTokens = (plainToken: string, hashedToken: string): boolean => {
  const hashedPlainToken = hashToken(plainToken);
  return crypto.timingSafeEqual(
    Buffer.from(hashedPlainToken),
    Buffer.from(hashedToken)
  );
};
