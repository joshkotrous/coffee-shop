#!/bin/bash

# Coffee Shop Agent Setup Script
# This script sets up the entire application in one go for automated deployment

# Function to securely prompt for admin credentials
prompt_admin_credentials() {
    echo "👤 Please enter the default admin credentials manually to avoid exposure:"
    read -p "   Email: " ADMIN_EMAIL
    read -sp "   Password: " ADMIN_PASSWORD
    echo ""
    echo "⚠️  Make sure to keep these credentials secure and do not share them publicly."
}

echo "🚀 Starting Coffee Shop automated setup..."

# Step 1: Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Step 2: Create environment file
echo "⚙️  Creating environment configuration..."
cat > .env.local << EOF
DATABASE_URL=postgresql://admin:password@localhost:5432/coffee_shop
JWT_SECRET=coffee-shop-secret-key-2024
NEXT_PUBLIC_APP_URL=http://localhost:3000
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

# Prompt for admin credentials securely instead of printing them
prompt_admin_credentials

# Instructions for testing setup without exposing credentials
echo ""
echo "🎯 To test the setup, use your entered admin credentials to authenticate."
echo "   For example, run these commands in a new terminal (replace with your credentials):"
echo "   curl -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}'"
echo "   curl http://localhost:3000/api/products"
echo ""
echo "🚀 Starting development server..."

npm run dev
