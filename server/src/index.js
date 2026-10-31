import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Aarohan API Server running' });
});

// Admin endpoints
app.use('/api/v1/admin', adminRoutes);

// Central error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
