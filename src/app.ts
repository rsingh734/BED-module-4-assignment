import express from "express";
import {
    accessLogger,
    errorLogger,
    consoleLogger,
} from "./api/v1/middleware/logger";
import errorHandler from "./api/v1/middleware/errorHandler";
import loanRoutes from "./api/v1/routes/loanRoutes";
import userRoutes from "./api/v1/routes/userRotes";
import adminRoutes from "./api/v1/routes/adminRoutes";

const app = express();

// ========================
// MIDDLEWARE ORDER MATTERS
// ========================

// 1. Logging Middleware (FIRST - captures all incoming requests)
if (process.env.NODE_ENV === "production") {
    // In production, log to files
    app.use(accessLogger);  // Log all requests to access.log
    app.use(errorLogger);   // Log errors to error.log
} else {
    // In development, log to console for immediate feedback
    app.use(consoleLogger); // Colored console output
}

// 2. Body Parsing Middleware (SECOND - parse request bodies before routes)
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// 3. Health Check Route (no authentication required)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 4. Public API Routes (no authentication required)
app.get('/api/v1/public/status', (req, res) => {
  res.status(200).json({
    message: 'Public API endpoint',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Test route for body parsing (POST)
app.post('/api/v1/public/status', (req, res) => {
  res.status(200).json({
    message: 'Public API endpoint',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Test route for error propagation
app.get('/api/v1/test/error', (req, res, next) => {
  next(new Error('Test error for middleware integration'));
});

// ========================
// PROTECTED API ROUTES
// ========================

// 5. API Routes with Authentication & Authorization
app.use("/api/v1", loanRoutes);  // Loan routes with auth middleware
app.use("/api/v1", userRoutes);  // User routes
app.use("/api/v1", adminRoutes); // Admin routes

// ========================
// ERROR HANDLING
// ========================

// 6. 404 Handler - Catch unhandled routes (BEFORE error handler)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  });
});

// 7. Global Error Handling Middleware (LAST - catches all errors)
app.use(errorHandler);

export default app;