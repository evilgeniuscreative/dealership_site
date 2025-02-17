import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export const generateSecret = () => {
  return speakeasy.generateSecret({
    name: 'Dealership Admin',
    issuer: 'Dealership',
  });
};

export const generateQRCode = async (secret: string): Promise<string> => {
  const otpauthUrl = speakeasy.otpauthURL({
    secret,
    label: 'Dealership Admin',
    issuer: 'Dealership',
  });

  return QRCode.toDataURL(otpauthUrl);
};

export const verifyToken = (secret: string, token: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1, // Allow 30 seconds of time drift
  });
};

export const generateBackupCodes = (count: number = 8): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
};

export const hashBackupCode = (code: string): string => {
  return crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');
};
