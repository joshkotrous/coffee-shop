#!/bin/bash

echo "Setting up Coffee Shop Demo Application..."

# Check if JWT_SECRET environment variable is set and non-empty
if [ -z "$JWT_SECRET" ]; then
    echo "Error: JWT_SECRET environment variable is not set or empty."
    echo "Please set JWT_SECRET before running this script to ensure secure JWT token signing."
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
DATABASE_URL=postgresql://admin:password@localhost:5432/coffee_shop
JWT_SECRET=${JWT_SECRET}
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    # Secure the .env.local file permissions
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
