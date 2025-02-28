#!/bin/bash

# This script helps set up a local MySQL database for the dealership project

# Step 1: Start MySQL service
echo "Starting MySQL service..."
brew services start mysql

# Step 2: Secure MySQL installation (set root password, etc.)
echo "Please run the following command manually to secure your MySQL installation:"
echo "mysql_secure_installation"
echo "-----"
echo "When prompted:"
echo "- Answer 'n' to VALIDATE PASSWORD COMPONENT if you want a simple password"
echo "- Set a root password (or leave blank for no password for local development)"
echo "- Answer 'y' to remove anonymous users"
echo "- Answer 'n' to disallow root login remotely for local development"
echo "- Answer 'y' to remove test database"
echo "- Answer 'y' to reload privilege tables"
echo "-----"

# Wait for user to complete the secure installation
read -p "Press Enter when you have completed the secure installation (or Ctrl+C to exit)..."

# Step 3: Create database and tables
echo "Creating database and tables..."
echo "Please enter your MySQL root password (or press Enter if no password):"
read -s mysql_password

# If password is empty
if [ -z "$mysql_password" ]; then
  mysql < scripts/init-database.sql
else
  mysql -u root -p"$mysql_password" < scripts/init-database.sql
fi

echo "Database setup completed!"
echo "Default admin credentials:"
echo "- Username: admin@example.com"
echo "- Password: Admin@123"
echo "Please update these credentials in production!"

# Step 4: Instructions for updating .env file
echo "-----"
echo "Next steps:"
echo "1. Create or update your .env file with the following database settings:"
echo "DB_HOST=localhost"
echo "DB_USER=root"
echo "DB_PASSWORD=[your MySQL root password]"
echo "DB_NAME=dealership_db"
echo "2. Start your application with 'npm run dev'"
