#!/bin/bash

# Coffee Shop Agent Setup Script
# This script sets up the entire application in one go for automated deployment

# Load sensitive environment variables from a secure external source or prompt user input
# This avoids hardcoding sensitive credentials in the script

# Prompt for DATABASE_URL if not set in environment
if [ -z "$DATABASE_URL" ]; then
  echo "Enter the DATABASE_URL (e.g., postgresql://user:password@host:port/dbname):"
  read -r DATABASE_URL
fi

# Prompt for JWT_SECRET if not set in environment
if [ -z "$JWT_SECRET" ]; then
  echo "Enter the JWT_SECRET key:"
  read -r JWT_SECRET
fi

# Prompt for NEXT_PUBLIC_APP_URL if not set in environment
if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
  echo "Enter the NEXT_PUBLIC_APP_URL (e.g., http://localhost:3000):"
  read -r NEXT_PUBLIC_APP_URL
fi

echo "🚀 Starting Coffee Shop automated setup..."

# Step 1: Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Step 2: Create environment file
# Write environment variables from the environment or user input, avoiding hardcoded secrets

echo "⚙️  Creating environment configuration..."
cat > .env.local << EOF
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
EOF

# Step 3: Start database
echo "🐘 Starting PostgreSQL database..."
docker compose up -d

# Step 4: Wait for database initialization
echo "⏳ Waiting for database to initialize (10 seconds)..."
sleep 10

# Step 5: Verify database
echo "✅ Verifying database setup..."
docker exec coffee-shop-db psql -U admin -d coffee_shop -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database initialized successfully"
else
    echo "❌ Database initialization failed"
    exit 1
fi

# Step 6: Start application
echo "🌐 Starting Next.js application..."
echo "📍 Application will be available at:"
echo "   - Primary:  http://localhost:3000"
echo "   - Fallback: http://localhost:3001 (if port 3000 is occupied)"
echo ""
echo "👤 Default admin credentials:"
echo "   Email: admin@coffeeshop.com"
echo "   Password: admin123"
echo ""
echo "🎯 To test the setup, run these commands in a new terminal:"
echo "   curl -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{\"email\": \"admin@coffeeshop.com\", \"password\": \"admin123\"}'"
echo "   curl http://localhost:3000/api/products"
echo ""
echo "🚀 Starting development server..."

npm run dev
