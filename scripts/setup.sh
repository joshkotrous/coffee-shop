#!/bin/bash

# Prompt for database username and password to avoid hardcoding credentials
read -p "Enter database username: " DB_USERNAME
read -sp "Enter database password: " DB_PASSWORD
echo

# Validate inputs
if [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
    echo "Error: Database username and password must be provided."
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
DATABASE_URL=postgresql://$DB_USERNAME:$DB_PASSWORD@localhost:5432/coffee_shop
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

echo "Setup complete! You can now run:"
echo "  npm run dev"
echo ""
echo "Default admin credentials:"  # This message is informational and can be updated as needed
echo "  Email: admin@coffeeshop.com"
echo "  Password: admin123"
