# Coffee Shop Demo Application

A functional coffee shop demo built with Next.js, PostgreSQL, and TypeScript. This application demonstrates a complete e-commerce workflow with user authentication, product catalog, shopping cart, and admin portal.

## Features

- **User Authentication**: Registration and login system
- **Product Catalog**: Browse coffee and pastry offerings
- **Shopping Cart**: Add items, manage quantities, and checkout
- **Order Management**: Track purchase history
- **Admin Portal**: Manage products and view all orders
- **Database Integration**: PostgreSQL with proper schema design

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

### Automated Setup (For Agents/Scripts)

**Single command for agents to get everything running:**

```bash
# Option 1: Use the agent setup script
./agent-setup.sh

# Option 2: One-line command
npm install && echo 'DATABASE_URL=postgresql://admin:password@localhost:5432/coffee_shop
JWT_SECRET=coffee-shop-secret-key-2024
NEXT_PUBLIC_APP_URL=http://localhost:3000' > .env.local && docker compose up -d && sleep 10 && npm run dev
```

### Manual Setup

1. **Clone and setup the project:**

   ```bash
   git clone <repository-url>
   cd coffee-shop
   ./scripts/setup.sh
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Access the application:**
   - **Main Store**: http://localhost:3000 (or http://localhost:3001 if port 3000 is occupied)
   - **Admin Panel**: http://localhost:3000/admin

### Agent Setup Instructions

If you're an AI agent or automated system setting up this repository:

1. **Complete Setup Command:**

   ```bash
   # Run this single command to get everything working
   npm install && \
   echo 'DATABASE_URL=postgresql://admin:password@localhost:5432/coffee_shop
   JWT_SECRET=coffee-shop-secret-key-2024
   NEXT_PUBLIC_APP_URL=http://localhost:3000' > .env.local && \
   docker compose up -d && \
   sleep 10 && \
   npm run dev
   ```

2. **Verification Steps:**

   ```bash
   # Test database connection
   docker exec coffee-shop-db psql -U admin -d coffee_shop -c "SELECT COUNT(*) FROM users;"

   # Test admin login (run in separate terminal after app starts)
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@coffeeshop.com", "password": "admin123"}'

   # Test products API
   curl http://localhost:3000/api/products
   ```

3. **Important Notes for Agents:**
   - **Wait time**: Always wait 10+ seconds after `docker compose up -d` for database initialization
   - **Port handling**: App auto-switches to port 3001 if 3000 is occupied
   - **Database reset**: If issues occur, run `docker compose down -v && docker compose up -d` to reset
   - **Log monitoring**: Check `docker compose logs postgres` for database issues

### Default Credentials

- **Admin Account**:
  - Email: `admin@coffeeshop.com`
  - Password: `admin123`

## Project Structure

```
coffee-shop/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── products/      # Product management
│   │   └── orders/        # Order processing
│   ├── components/        # React components
│   ├── admin/            # Admin portal pages
│   └── globals.css       # Global styles
├── lib/                   # Utility libraries
│   ├── db.ts             # Database connection
│   ├── auth.ts           # Authentication utilities
│   └── middleware.ts     # Request middleware
├── database/             # Database schema and migrations
│   └── init.sql          # Initial schema and seed data
├── scripts/              # Setup and utility scripts
└── docker-compose.yml    # Database container setup
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products` - List all products
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only)

### Orders

- `GET /api/orders` - List orders (user's orders or all for admin)
- `POST /api/orders` - Create new order

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - User accounts and authentication
- `products` - Coffee shop inventory
- `orders` - Purchase orders
- `order_items` - Individual items within orders

## Development

### Database Management

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs postgres

# Connect to database
docker exec -it coffee-shop-db psql -U admin -d coffee_shop
```

### Environment Variables

The application will create `.env.local` automatically, but you can also create it manually:

```bash
DATABASE_URL=postgresql://admin:password@localhost:5432/coffee_shop
JWT_SECRET=coffee-shop-secret-key-2024
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Demo Usage

1. **As a Customer:**
   - Register a new account or login
   - Browse products in the catalog
   - Add items to cart
   - Complete checkout process
   - View order history

2. **As an Admin:**
   - Login with admin credentials
   - Access admin panel from the main page
   - Add, edit, or delete products
   - View all customer orders
   - Manage inventory levels

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL 15
- **Authentication**: JWT with HTTP-only cookies
- **Password Hashing**: bcrypt
- **Containerization**: Docker Compose

## Notes

This is a demo application designed for demonstration and testing purposes. For production use, additional security measures and features would be required.

For security testing information, see `vulnerabilityinfo.md`.

## Quick Test Commands

After setup, verify everything works:

```bash
# Test admin login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@coffeeshop.com", "password": "admin123"}'

# Test product listing
curl http://localhost:3000/api/products

# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

Expected responses:

- Login: `{"message":"Login successful","user":{"id":1,"email":"admin@coffeeshop.com","role":"admin"}}`
- Products: Array of 8 coffee/pastry products with numeric prices
- Registration: `{"message":"Registration successful","user":{"id":2,"email":"test@example.com","role":"user"}}`
