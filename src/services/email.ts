import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"Dealership Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this reset, please ignore this email.</p>
    `,
  });
};

export const send2FASetupEmail = async (
  to: string,
  qrCodeUrl: string,
  backupCodes: string[]
): Promise<void> => {
  await transporter.sendMail({
    from: `"Dealership Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: '2FA Setup Information',
    html: `
      <h1>Two-Factor Authentication Setup</h1>
      <p>Scan the QR code below with your authenticator app:</p>
      <img src="${qrCodeUrl}" alt="2FA QR Code" />
      <h2>Backup Codes</h2>
      <p>Store these backup codes in a safe place. You can use them to log in if you lose access to your authenticator app:</p>
      <pre>${backupCodes.join('\n')}</pre>
      <p>Each backup code can only be used once.</p>
    `,
  });
};

export const sendLoginAlertEmail = async (
  to: string,
  ipAddress: string,
  userAgent: string,
  location: string
): Promise<void> => {
  await transporter.sendMail({
    from: `"Dealership Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: 'New Login Detected',
    html: `
      <h1>New Login to Your Account</h1>
      <p>We detected a new login to your account with the following details:</p>
      <ul>
        <li>IP Address: ${ipAddress}</li>
        <li>Browser/Device: ${userAgent}</li>
        <li>Location: ${location}</li>
        <li>Time: ${new Date().toLocaleString()}</li>
      </ul>
      <p>If this wasn't you, please change your password immediately and enable 2FA if you haven't already.</p>
    `,
  });
};
