import express from 'express';

import { registerUser, loginUser, retrieveUser } from '../controllers/register.controller';
import { loginUserValidator, registerUserValidator } from '../validators/auth.validator';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = express.Router();

router.get('/me', authenticate, retrieveUser);

router.post('/register', registerUserValidator, validate, registerUser);

router.post('/login', loginUserValidator, validate, loginUser);

export default router;
