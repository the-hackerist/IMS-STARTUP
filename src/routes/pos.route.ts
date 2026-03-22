import { authenticate } from './../middlewares/auth.middleware';
import express from 'express';

import {
  retrieveAllSales,
  retrieveOneSales,
  addSales,
  voidSale,
} from '../controllers/pos.controller';
import {
  addSalesValidator,
  retrieveAllSalesValidator,
  retrieveOneSalesValidator,
  voidSalesValidator,
} from '../validators/pos.validator';
import { validate } from '../middlewares/validate.middleware';

const router = express.Router();

router.get('/sales/{:id}', authenticate, retrieveOneSalesValidator, validate, retrieveOneSales);

router.get('/sales', retrieveAllSalesValidator, validate, authenticate, retrieveAllSales);

router.post('/sales', authenticate, addSalesValidator, validate, addSales);

router.patch('/sales/void/{:id}', voidSalesValidator, validate, authenticate, voidSale);

export default router;
