-- AUREA × JewelPro — Complete Supabase PostgreSQL Schema Script
-- Copy and paste this directly into your Supabase SQL Editor.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
  sku VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL, -- Rings, Necklaces, Earrings, Bangles, Anklets
  metal VARCHAR(50) NOT NULL, -- Gold, Platinum, Silver, Rose Gold
  purity VARCHAR(20) NOT NULL, -- 22K, 18K, 24K, PT950, 925
  weight DECIMAL(10, 2) NOT NULL, -- Weight in grams
  making_charges DECIMAL(10, 2) NOT NULL, -- Making charge per gram
  stock_count INTEGER NOT NULL DEFAULT 5,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customers CRM Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  loyalty_points INTEGER DEFAULT 0,
  birthday DATE,
  gold_scheme_status VARCHAR(20) DEFAULT 'Inactive', -- Active, Matured, Inactive
  scheme_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders & POS Transactions Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(100) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  making_charges DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(12, 2) DEFAULT 0.00,
  gst DECIMAL(12, 2) NOT NULL, -- 3% GST
  total DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- Razorpay, UPI, Cash, Card, EMI
  payment_status VARCHAR(20) DEFAULT 'Completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Billed Items Relation Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sku VARCHAR(50) REFERENCES products(sku),
  quantity INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL
);

-- 5. General Accounting Ledger Table
CREATE TABLE IF NOT EXISTS ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description VARCHAR(255) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('Credit', 'Debit')),
  amount DECIMAL(12, 2) NOT NULL,
  running_balance DECIMAL(12, 2) NOT NULL
);

-- 6. Gold Savings Schemes Table
CREATE TABLE IF NOT EXISTS gold_schemes (
  id VARCHAR(50) PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  customer_name VARCHAR(150) NOT NULL,
  monthly_installment DECIMAL(12, 2) NOT NULL,
  months_paid INTEGER DEFAULT 1,
  total_invested DECIMAL(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Active' -- Active, Matured, Redeemed
);

-- 7. Repair Jobs Table
CREATE TABLE IF NOT EXISTS repair_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  item_description TEXT NOT NULL,
  estimated_cost DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Received', -- Received, In Progress, Ready, Delivered
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  email VARCHAR(150) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for rapid queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_ledger_date ON ledger(transaction_date);
