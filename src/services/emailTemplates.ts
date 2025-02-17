interface EmailData {
  username?: string;
  resetLink?: string;
  loginDetails?: {
    ip: string;
    browser: string;
    location: string;
    time: string;
  };
  qrCode?: string;
  backupCodes?: string[];
}

export const getWelcomeEmailTemplate = (data: EmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .button { 
      display: inline-block;
      padding: 12px 24px;
      background-color: #1a73e8;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Dealership Admin!</h1>
    </div>
    <p>Hello ${data.username},</p>
    <p>Welcome to the Dealership Admin panel. Your account has been successfully created.</p>
    <p>You can now access the admin panel to manage inventory, customer inquiries, and more.</p>
    <p>For security reasons, we recommend enabling two-factor authentication in your account settings.</p>
    <p>Best regards,<br>The Dealership Team</p>
  </div>
</body>
</html>
`;

export const getPasswordResetTemplate = (data: EmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .button { 
      display: inline-block;
      padding: 12px 24px;
      background-color: #1a73e8;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    .warning { color: #d93025; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <p>Hello,</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <p style="text-align: center;">
      <a href="${data.resetLink}" class="button">Reset Password</a>
    </p>
    <p>This link will expire in 1 hour.</p>
    <p class="warning">If you didn't request this reset, please ignore this email or contact support if you have concerns.</p>
    <p>Best regards,<br>The Dealership Team</p>
  </div>
</body>
</html>
`;

export const getLoginAlertTemplate = (data: EmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .details { 
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .warning { color: #d93025; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Login Detected</h1>
    </div>
    <p>Hello,</p>
    <p>We detected a new login to your account with the following details:</p>
    <div class="details">
      <p><strong>Time:</strong> ${data.loginDetails?.time}</p>
      <p><strong>IP Address:</strong> ${data.loginDetails?.ip}</p>
      <p><strong>Browser:</strong> ${data.loginDetails?.browser}</p>
      <p><strong>Location:</strong> ${data.loginDetails?.location}</p>
    </div>
    <p class="warning">If this wasn't you, please change your password immediately and enable 2FA if you haven't already.</p>
    <p>Best regards,<br>The Dealership Team</p>
  </div>
</body>
</html>
`;

export const get2FASetupTemplate = (data: EmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .qr-code { text-align: center; margin: 20px 0; }
    .backup-codes {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      font-family: monospace;
    }
    .important { color: #d93025; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Two-Factor Authentication Setup</h1>
    </div>
    <p>Hello ${data.username},</p>
    <p>You've enabled two-factor authentication for your account. Here's what you need to know:</p>
    
    <h2>1. Scan QR Code</h2>
    <p>Use your authenticator app (Google Authenticator, Authy, etc.) to scan this QR code:</p>
    <div class="qr-code">
      <img src="${data.qrCode}" alt="2FA QR Code" />
    </div>

    <h2>2. Backup Codes</h2>
    <p>Store these backup codes safely. You can use them to log in if you lose access to your authenticator app:</p>
    <div class="backup-codes">
      ${data.backupCodes?.join('<br>')}
    </div>
    
    <p class="important">Important: Each backup code can only be used once. Keep them in a secure place!</p>
    
    <p>Best regards,<br>The Dealership Team</p>
  </div>
</body>
</html>
`;

export const getAccountLinkingTemplate = (data: EmailData) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .info {
      background-color: #e8f0fe;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Account Linked Successfully</h1>
    </div>
    <p>Hello ${data.username},</p>
    <p>Your Google account has been successfully linked to your Dealership Admin account.</p>
    <div class="info">
      <p>You can now log in using either:</p>
      <ul>
        <li>Your email and password</li>
        <li>The "Continue with Google" button</li>
      </ul>
    </div>
    <p>If you didn't authorize this action, please contact support immediately.</p>
    <p>Best regards,<br>The Dealership Team</p>
  </div>
</body>
</html>
`;
