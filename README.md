# API Gateway

A centralized API Gateway service that routes requests to various microservices with Redis caching.

## Architecture

This API Gateway implements the architecture shown in the flowchart:

- **API Gateway**: Express.js application that routes requests to microservices
- **Redis Cache**: For caching responses from microservices
- **Microservices**:
  - Clients Service (Node.js)
  - Projects Service (Java)
  - Employees Service (Python)
  - Hiring Service (Go)

## Features

- Request routing to appropriate microservices
- Response caching with Redis
- Rate limiting and request throttling
- Error handling and logging
- Security headers with Helmet

## Setup

### Prerequisites

- Node.js (v14+)
- Docker and Docker Compose

### Installation

```bash
npm install
```

### Running Redis

Start Redis using Docker Compose:

```bash
docker-compose up -d
```

### Starting the API Gateway

```bash
npm run dev
```

## Project Structure

The project follows a modular structure:

```
src/
├── config/           # Configuration files
│   ├── app.js        # Express app configuration
│   ├── microservices.js # Microservices endpoints configuration
│   └── redis.js      # Redis client configuration
├── middleware/       # Middleware functions
│   ├── cache.js      # Redis caching middleware
│   ├── errorHandler.js # Error handling middleware
│   └── rateLimit.js  # Rate limiting middleware
├── routes/           # Route definitions
│   ├── health.js     # Health check routes
│   └── proxy.js      # Proxy routes to microservices
└── index.js          # Application entry point
```

## Endpoints

- `/api/clients/*` - Routes to the Clients Service
- `/api/projects/*` - Routes to the Projects Service
- `/api/employees/*` - Routes to the Employees Service
- `/api/hiring/*` - Routes to the Hiring Service
- `/health` - Health check endpoint

## Configuration

The API Gateway is configured to connect to the following services:

- Clients Service: http://localhost:3001
- Projects Service: http://localhost:3002
- Employees Service: http://localhost:3003
- Hiring Service: http://localhost:3004

You can modify these settings in the `src/config/microservices.js` file.

## Cache Configuration

By default, GET requests are cached for 5 minutes (300 seconds). You can modify this in the cacheMiddleware function in `src/middleware/cache.js`.
# api-gateway-hrms
