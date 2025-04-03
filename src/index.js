// Load environment variables
import 'dotenv/config';

import { app, PORT } from './config/app.js';
import { connectRedis } from './config/redis.js';
import { limiter, speedLimiter } from './middleware/rateLimit.js';
import errorHandler from './middleware/errorHandler.js';
import setupProxyRoutes from './routes/proxy.js';
import healthRoutes from './routes/health.js';

// Initialize Redis
connectRedis();

// Apply rate limiting to all requests
app.use(limiter);
app.use(speedLimiter);

// Set up health check routes
app.use(healthRoutes);

// Set up proxy routes to microservices
setupProxyRoutes(app);

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
