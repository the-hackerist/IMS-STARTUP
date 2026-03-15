import express from 'express';
import dotenv from 'dotenv';

import inventoryRouter from './routes/inventory.route';
import authRouter from './routes/auth.route';
import { errorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/AppError';

// idea compression, helmet, cors, logging, rate-limiter

const BASE_URL = `/api/v1`;

dotenv.config();

const app = express();

app.use(express.json());

app.use(`${BASE_URL}/inventory`, inventoryRouter);
app.use(`${BASE_URL}/auth`, authRouter);

app.use('/*splat', (req, res, next) => {
  const err = new AppError('Endpoint not found', 404);

  next(err);
});

app.use(errorHandler);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`🚀 App is running on http://localhost:${process.env.SERVER_PORT}`);
});
