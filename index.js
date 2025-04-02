const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const redis = require('redis');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Speed limiter
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes without delay
  delayMs: 500, // add 500ms of delay per request above threshold
});

app.use(speedLimiter);

// Redis client setup
let redisClient;

// Connect to Redis
const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

connectRedis();

// Cache middleware
const cacheMiddleware = async (req, res, next) => {
  // Skip caching for non-GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = `cache:${req.originalUrl}`;

  try {
    // Check if data exists in cache
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      console.log('Cache hit for:', req.originalUrl);
      return res.json(JSON.parse(cachedData));
    }
    
    // Store the original send function
    const originalSend = res.send;

    // Override the send function to cache the response
    res.send = function (body) {
      if (res.statusCode === 200) {
        // Cache successful responses for 5 minutes (300 seconds)
        redisClient.setEx(cacheKey, 300, body);
        console.log('Cached response for:', req.originalUrl);
      }
      
      // Call the original send function
      originalSend.call(this, body);
    };

    next();
  } catch (error) {
    console.error('Cache error:', error);
    next();
  }
};

// Microservice routes
const microservices = {
  clients: {
    url: 'http://localhost:3001',
    pathRewrite: {'^/api/clients': '/'},
  },
  projects: {
    url: 'http://localhost:3002',
    pathRewrite: {'^/api/projects': '/'},
  },
  employees: {
    url: 'http://localhost:3003',
    pathRewrite: {'^/api/employees': '/'},
  },
  hiring: {
    url: 'http://localhost:3004',
    pathRewrite: {'^/api/hiring': '/'},
  },
};

// Configure proxy routes with caching
Object.entries(microservices).forEach(([service, config]) => {
  app.use(
    `/api/${service}`,
    cacheMiddleware,
    createProxyMiddleware({
      target: config.url,
      changeOrigin: true,
      pathRewrite: config.pathRewrite,
      onProxyReq: (proxyReq, req, res) => {
        // Add service-specific headers if needed
        proxyReq.setHeader('X-Service', service);
      },
      onError: (err, req, res) => {
        console.error(`Proxy error for ${service}:`, err);
        res.status(500).json({ error: `Service ${service} is currently unavailable` });
      },
    })
  );
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Gateway Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
