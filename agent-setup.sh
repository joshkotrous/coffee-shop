#!/bin/bash

# Coffee Shop Agent Setup Script
# This script sets up the entire application in one go for automated deployment

# Load sensitive credentials from environment variables or prompt user

# Function to prompt for input if variable is not set
prompt_for_secret() {
  local var_name="$1"
  local prompt_message="$2"
  local secret_value

  # Check if environment variable is set
  secret_value="${!var_name}"
  if [ -z "$secret_value" ]; then
    # Prompt user for input
    read -s -p "$prompt_message: " secret_value
    echo
  fi
  echo "$secret_value"
}

# Prompt for DATABASE_URL and JWT_SECRET if not set in environment
DATABASE_URL=$(prompt_for_secret "DATABASE_URL" "Enter the DATABASE_URL")
JWT_SECRET=$(prompt_for_secret "JWT_SECRET" "Enter the JWT_SECRET")

# Step 1: Install dependencies
echo "🚀 Starting Coffee Shop automated setup..."
echo "📦 Installing Node.js dependencies..."
npm install

# Step 2: Create environment file
echo "⚙️  Creating environment configuration..."
cat > .env.local << EOF
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
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
