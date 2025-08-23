#!/bin/bash

# Coffee Shop Agent Setup Script
# This script sets up the entire application in one go for automated deployment

echo "🚀 Starting Coffee Shop automated setup..."

# Step 1: Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Step 2: Create environment file
# Instead of hardcoding sensitive credentials, read them from environment variables
# Fail if required environment variables are not set

if [ -z "$DATABASE_URL" ] || [ -z "$JWT_SECRET" ] || [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    echo "❌ Required environment variables DATABASE_URL, JWT_SECRET, or NEXT_PUBLIC_APP_URL are not set."
    echo "Please set them before running this script."
    exit 1
fi

echo "⚙️  Creating environment configuration from environment variables..."
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
