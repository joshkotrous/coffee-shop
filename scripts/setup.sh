#!/bin/bash

# Load environment variables from a secure location or prompt user input
# This avoids hardcoding sensitive credentials in the script

# Prompt for DATABASE_URL if not set
if [ -z "$DATABASE_URL" ]; then
    echo "Enter the DATABASE_URL (e.g., postgresql://user:password@host:port/dbname):"
    read -r DATABASE_URL
fi

# Prompt for JWT_SECRET if not set
if [ -z "$JWT_SECRET" ]; then
    echo "Enter the JWT_SECRET key:"
    read -r JWT_SECRET
fi

# Prompt for NEXT_PUBLIC_APP_URL if not set
if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    echo "Enter the NEXT_PUBLIC_APP_URL (e.g., http://localhost:3000):"
    read -r NEXT_PUBLIC_APP_URL
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
EOF
else
    echo ".env.local already exists"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Start database
echo "Starting database with Docker Compose..."
docker compose up -d

# Wait for database to be ready
echo "Waiting for database to initialize..."
sleep 10

echo "Setup complete! You can now run:"
echo "  npm run dev"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@coffeeshop.com"
echo "  Password: admin123"
