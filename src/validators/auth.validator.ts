import { body } from 'express-validator';

export const registerUserValidator = [
  body('username')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('A username must be between 2 and 100 characters long'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ min: 6, max: 254 })
    .withMessage('An email must not exceed 254 characters')
    .isEmail({ require_tld: true, allow_utf8_local_part: true })
    .withMessage('This field must be an email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 256 })
    .withMessage('Password must be between 8 and 256 characters')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage('Password must be 8+ chars and include upper, lower and a number'),
];

export const loginUserValidator = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ min: 6, max: 254 })
    .withMessage('An email must not exceed 254 characters')
    .isEmail({ require_tld: true, allow_utf8_local_part: true })
    .withMessage('This field must be an email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8, max: 256 })
    .withMessage('Password must be between 8 and 256 characters'),
];
