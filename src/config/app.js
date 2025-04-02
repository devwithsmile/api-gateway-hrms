import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Apply basic middleware
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(cors());

export { app, PORT };
