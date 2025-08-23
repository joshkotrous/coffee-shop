#!/bin/bash

# Secure setup script for Coffee Shop Demo Application

echo "Setting up Coffee Shop Demo Application..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    # Prompt user for sensitive credentials instead of hardcoding
    read -p "Enter DATABASE_URL (e.g., postgresql://user:password@localhost:5432/coffee_shop): " DATABASE_URL
    read -p "Enter JWT_SECRET: " JWT_SECRET
    read -p "Enter NEXT_PUBLIC_APP_URL (e.g., http://localhost:3000): " NEXT_PUBLIC_APP_URL

    # Validate inputs are not empty
    if [ -z "$DATABASE_URL" ] || [ -z "$JWT_SECRET" ] || [ -z "$NEXT_PUBLIC_APP_URL" ]; then
        echo "Error: All environment variables must be provided. Exiting setup."
        exit 1
    fi

    # Write to .env.local securely
    cat > .env.local << EOF
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
EOF
else
    echo ".env.local already exists"
fi

# Install dependencies
npm install

# Start database
docker compose up -d

# Wait for database to be ready
sleep 10

echo "Setup complete! You can now run:"
echo "  npm run dev"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@coffeeshop.com"
echo "  Password: admin123"
