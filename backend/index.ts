import express, { Request, Response } from 'express';
import cors from 'cors';
import { createExpressEndpoints } from '@ts-rest/express';
import { dealsContract } from '@shared/contract';
import { dealsRouter } from './src/routes/deals.router';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ts-rest API routes
createExpressEndpoints(dealsContract, dealsRouter, app);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});