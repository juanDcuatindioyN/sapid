import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './database/config';
import authRoutes from './routes/authRoutes';
import scaleRoutes from './routes/scaleRoutes';
import pesajeRoutes from './routes/pesajeRoutes';
import ticketRoutes from './routes/ticketRoutes';
import logRoutes from './routes/logRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  helmet({
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
  })
);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database health check endpoint
app.get('/health/db', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected', error: (error as Error).message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scale', scaleRoutes);
app.use('/api/pesaje', pesajeRoutes);
app.use('/api/ticket', ticketRoutes);
app.use('/api/logs', logRoutes);

// Initialize database connection and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 SAPID Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

export default app;
