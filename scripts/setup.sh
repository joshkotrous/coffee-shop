#!/bin/bash

echo "Setting up Coffee Shop Demo Application..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
DATABASE_URL=postgresql://admin:password@localhost:5432/coffee_shop
JWT_SECRET=coffee-shop-secret-key-2024
NEXT_PUBLIC_APP_URL=http://localhost:3000
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

# Removed printing of default admin credentials to avoid exposing sensitive information

echo "Setup complete! You can now run:"
echo "  npm run dev"
echo ""
