import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

import inventoryRouter from './routes/inventory.route';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/v1/inventory', inventoryRouter);

// test route
app.get('/', (req: Request, res: Response) => {
  res.send('This server is working, hello world! 👋🌍💥');
});

app.use(errorHandler);

// todo centralized error handler

app.listen(process.env.SERVER_PORT, () => {
  console.log(`🚀 App is running on http://localhost:${process.env.SERVER_PORT}`);
});
