# Admin Dashboard for Home Improvement Proposal Tool

This project provides a comprehensive admin dashboard for managing a home improvement proposal tool. It includes UI components for product management, pricing, financing, and user administration.

## Features

- **Dashboard**: Main dashboard with metrics, trends, and activity monitoring
- **Product Management**: CRUD operations for product categories and products
- **Pricing Management**: Pricing controls with Excel import/export functionality
- **Financing Options**: Management of provider-specific financing plans
- **User Management**: Administration of users, roles, and permissions
- **API Layer**: RESTful endpoints for all data operations

## Database Setup

The application requires a PostgreSQL database. You can find the database schema migrations in the `migrations` folder. Run these migrations in your database management tool in the following order:

1. `create_user_tables.sql` - Creates roles, permissions, and admin_users tables
2. `create_product_tables.sql` - Sets up product categories and products
3. `create_financing_tables.sql` - Creates financing plans and calculations
4. `create_template_tables.sql` - Sets up scope templates, upsell offers, and bundle discounts
5. `create_pricing_table.sql` - Creates the pricing table for financing rates

## Environment Setup

Create a `.env` file in the root of the project with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/your-database-name
```

## Development

To start the development server:

```bash
npm run dev
```

## API Endpoints

The application provides the following API endpoints:

- `/api/products/categories` - CRUD for product categories
- `/api/products` - CRUD for products
- `/api/financing/plans` - CRUD for financing plans

## Architecture

The application follows a clean architecture approach:

1. **UI Layer**: React components for the admin dashboard
2. **API Layer**: Next.js API routes for data operations
3. **Database Layer**: PostgreSQL database for data storage

## Technologies Used

- Next.js
- React
- PostgreSQL
- Neon Serverless 
- Tailwind CSS
- Radix UI Components
