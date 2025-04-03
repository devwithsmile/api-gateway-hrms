import { createProxyMiddleware } from "http-proxy-middleware";
import cacheMiddleware from "../middleware/cache.js";
import microservices from "../config/microservices.js";

// Configure proxy routes
const setupProxyRoutes = (app) => {
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
          proxyReq.setHeader("X-Service", service);
        },
        onError: (err, req, res) => {
          console.error(`Proxy error for ${service}:`, err);
          res
            .status(500)
            .json({ error: `Service ${service} is currently unavailable` });
        },
      })
    );
  });
};

export default setupProxyRoutes;
