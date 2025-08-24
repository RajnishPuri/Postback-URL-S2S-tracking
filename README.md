# Postback URL System MVP

A complete Server-to-Server (S2S) tracking system for affiliate marketing built with Node.js, React, and PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Frontend Usage](#frontend-usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

## Overview

In affiliate marketing, Server-to-Server (S2S) postbacks are used to track conversions without relying on browser cookies or pixels. When a user makes a purchase, the advertiser's server notifies the affiliate's server directly through a postback URL.

### How it works:

1. **Click Tracking**: User clicks an affiliate link with tracking parameters
2. **Conversion**: User makes a purchase on the advertiser's site
3. **Postback**: Advertiser fires a postback URL to notify the affiliate system
4. **Dashboard**: Affiliate can view their conversions and revenue in real-time

## Features

- ✅ Click tracking with affiliate and campaign attribution
- ✅ Postback endpoint for conversion tracking
- ✅ Real-time affiliate dashboard with statistics
- ✅ Unique postback URL generation for each affiliate
- ✅ Comprehensive validation and error handling
- ✅ Professional React frontend with responsive design
- ✅ PostgreSQL database with proper indexing
- ✅ RESTful API architecture

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│  - Affiliate    │◄──►│  - Click API    │◄──►│  - affiliates   │
│    Selector     │    │  - Postback API │    │  - campaigns    │
│  - Dashboard    │    │  - Dashboard API│    │  - clicks       │
│  - Postback URL │    │  - CORS enabled │    │  - conversions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Git

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd postback-system
```

### 2. Set up PostgreSQL

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres createdb postback_system
sudo -u postgres psql -c "CREATE USER postback_user WITH PASSWORD 'postback_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE postback_system TO postback_user;"
```

### 3. Initialize database schema

```bash
cd backend
sudo -u postgres psql -d postback_system < schema.sql
```

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Configure environment variables

Create `.env` file in the backend directory:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postback_system
DB_USER=your_username
DB_PASSWORD=your_password
```

### 6. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 7. Start the applications

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

The backend will run on `http://localhost:5000` and frontend on `http://localhost:3000`.

## API Documentation

### Click Tracking Endpoint

Track affiliate clicks for conversion attribution.

**Endpoint:** `GET /click`

**Parameters:**
- `affiliate_id` (required): Affiliate identifier
- `campaign_id` (required): Campaign identifier  
- `click_id` (required): Unique click identifier

**Example:**
```bash
curl "http://localhost:5000/click?affiliate_id=1&campaign_id=1&click_id=abc123"
```

**Response:**
```json
{
  "status": "success",
  "message": "Click tracked successfully",
  "data": {
    "id": 1,
    "affiliate_id": 1,
    "campaign_id": 1,
    "click_id": "abc123",
    "timestamp": "2025-08-23T13:34:25.365Z"
  }
}
```

### Postback Endpoint

Record conversions for tracked clicks.

**Endpoint:** `GET /postback`

**Parameters:**
- `affiliate_id` (required): Affiliate identifier
- `click_id` (required): Click identifier from tracking link
- `amount` (required): Conversion amount
- `currency` (optional): Currency code (defaults to USD)

**Example:**
```bash
curl "http://localhost:5000/postback?affiliate_id=1&click_id=abc123&amount=100&currency=USD"
```

**Response:**
```json
{
  "status": "success",
  "message": "Conversion tracked",
  "data": {
    "id": 1,
    "click_id": 1,
    "amount": "100.00",
    "currency": "USD",
    "timestamp": "2025-08-23T13:34:30.279Z"
  }
}
```

### Dashboard API

Get affiliate data for dashboard display.

**Endpoint:** `GET /api/affiliate/:id`

**Example:**
```bash
curl "http://localhost:5000/api/affiliate/1"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "affiliate": {
      "id": 1,
      "name": "Affiliate One",
      "created_at": "2025-08-23T13:32:42.890Z"
    },
    "clicks": [...],
    "conversions": [...]
  }
}
```

### Additional Endpoints

- `GET /api/affiliates` - List all affiliates
- `GET /api/campaigns` - List all campaigns
- `GET /health` - Health check endpoint

## Frontend Usage

### 1. Affiliate Selection

Navigate to `http://localhost:3000` to see the affiliate selector. Choose an affiliate to view their dashboard.

### 2. Dashboard

The dashboard displays:
- Total clicks and conversions
- Conversion rate and revenue
- Recent clicks and conversions tables
- Navigation to postback URL page

### 3. Postback URL

Each affiliate has a unique postback URL template with:
- Complete URL with parameters
- Parameter explanations
- Integration instructions
- Copy-to-clipboard functionality

## Testing

### Manual Testing Flow

1. **Track a click:**
```bash
curl "http://localhost:5000/click?affiliate_id=1&campaign_id=1&click_id=test123"
```

2. **Fire a postback:**
```bash
curl "http://localhost:5000/postback?affiliate_id=1&click_id=test123&amount=100&currency=USD"
```

3. **View in dashboard:**
   - Open `http://localhost:3000`
   - Select "Affiliate One"
   - Verify the conversion appears

### Error Testing

**Invalid click tracking:**
```bash
curl "http://localhost:5000/click?affiliate_id=999&campaign_id=1&click_id=test"
# Returns: {"status":"error","message":"Invalid affiliate_id"}
```

**Invalid postback:**
```bash
curl "http://localhost:5000/postback?affiliate_id=1&click_id=nonexistent&amount=100"
# Returns: {"status":"error","message":"No matching click found"}
```

## Deployment

### Backend Deployment

The backend is configured to listen on `0.0.0.0` for external access and includes CORS support for cross-origin requests.

### Frontend Deployment

Build the React app for production:

```bash
cd frontend
npm run build
```

The `build` folder contains the production-ready static files.

### Environment Configuration

For production deployment, update the frontend API base URL and backend database configuration accordingly.

## Project Structure

```
postback-system/
├── backend/
│   ├── server.js           # Main Express server
│   ├── schema.sql          # Database schema
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── AffiliateSelector.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── PostbackUrl.tsx
│   │   ├── App.tsx         # Main App component
│   │   └── App.css         # Styles
│   └── package.json        # Frontend dependencies
└── README.md              # This file
```

## Database Schema

### Tables

- **affiliates**: Store affiliate information
- **campaigns**: Store campaign information  
- **clicks**: Track affiliate clicks with attribution
- **conversions**: Record conversions linked to clicks

### Relationships

- clicks → affiliates (many-to-one)
- clicks → campaigns (many-to-one)
- conversions → clicks (one-to-one)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For questions or issues, please create an issue in the repository or contact the development team.

