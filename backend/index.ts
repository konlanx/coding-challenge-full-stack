import express, { Request, Response } from 'express';
import cors from 'cors';
import { createExpressEndpoints } from '@ts-rest/express';
import { dealsContract, organizationsContract, incentivesContract, earningsContract } from '@shared/contract';
import { dealsRouter } from './src/routes/deals.router';
import { organizationsRouter } from './src/routes/organizations.router';
import { incentivesRouter } from './src/routes/incentives.router';
import { earningsRouter } from './src/routes/earnings.router';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

createExpressEndpoints(dealsContract, dealsRouter, app);
createExpressEndpoints(organizationsContract, organizationsRouter, app);
createExpressEndpoints(incentivesContract, incentivesRouter, app);
createExpressEndpoints(earningsContract, earningsRouter, app);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});