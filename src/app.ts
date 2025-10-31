import express from 'express';
import morgan from 'morgan';
import loanRoutes from './api/v1/routes/loanRoutes';

const app = express();

// Middleware
app.use(morgan('combined')); // HTTP request logging
app.use(express.json()); // Parse JSON request bodies

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/v1', loanRoutes);

export default app;