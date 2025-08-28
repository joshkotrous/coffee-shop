-- Coffee Shop Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

-- Insert admin user
-- Note: Admin user must be created securely outside of this script to avoid hardcoded credentials

-- Insert sample products
INSERT INTO products (name, description, price, image_url, stock_quantity) VALUES 
('Espresso', 'Rich and bold espresso shot', 2.50, '/images/espresso.jpg', 100),
('Cappuccino', 'Espresso with steamed milk and foam', 4.25, '/images/cappuccino.jpg', 50),
('Latte', 'Smooth espresso with steamed milk', 4.75, '/images/latte.jpg', 75),
('Americano', 'Espresso with hot water', 3.50, '/images/americano.jpg', 60),
('Mocha', 'Espresso with chocolate and steamed milk', 5.25, '/images/mocha.jpg', 40),
('Cold Brew', 'Smooth cold-brewed coffee', 3.75, '/images/coldbrew.jpg', 30),
('Croissant', 'Buttery French pastry', 3.00, '/images/croissant.jpg', 25),
('Blueberry Muffin', 'Fresh blueberry muffin', 2.75, '/images/muffin.jpg', 20);
