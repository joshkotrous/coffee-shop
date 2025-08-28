#!/bin/bash

# Generate a strong random JWT secret key
generate_jwt_secret() {
  # Generate a 32-byte base64 encoded random string
  openssl rand -base64 32
}

echo "Setting up Coffee Shop Demo Application..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    JWT_SECRET=$(generate_jwt_secret)
    cat > .env.local << EOF
DATABASE_URL=postgresql://admin:password@localhost:5432/coffee_shop
JWT_SECRET=$JWT_SECRET
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

echo "Setup complete! You can now run:"
echo "  npm run dev"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@coffeeshop.com"
echo "  Password: admin123"
