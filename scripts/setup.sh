#!/bin/bash

# This script sets up the Coffee Shop Demo Application environment
# It expects DATABASE_URL and JWT_SECRET to be provided as environment variables

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ] || [ -z "$JWT_SECRET" ]; then
    echo "Error: DATABASE_URL and JWT_SECRET environment variables must be set before running this script."
    exit 1
fi

echo "Setting up Coffee Shop Demo Application..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file with environment variables..."
    cat > .env.local << EOF
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    # Set strict permissions on .env.local to prevent unauthorized access
    chmod 600 .env.local
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
