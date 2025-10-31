import express from "express";
import {
    accessLogger,
    errorLogger,
    consoleLogger,
} from "../src/api/v1/middleware/logger";
import errorHandler from "../src/api/v1/middleware/errorHandler";
import loanRoutes from "./api/v1/routes/loanRoutes";

const app = express();

// Logging middleware (should be applied early in the middleware stack)
if (process.env.NODE_ENV === "production") {
    // In production, log to files
    app.use(accessLogger);
    app.use(errorLogger);
} else {
    // In development, log to console for immediate feedback
    app.use(consoleLogger);
}

// Body parsing middleware
app.use(express.json());

// API Routes
app.use("/api/v1", loanRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Global error handling middleware (MUST be applied last)
app.use(errorHandler);

export default app;