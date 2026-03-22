import { body, param, query } from 'express-validator';

export const retrieveAllSalesValidator = [
  query('page')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer, max limit must not be more than 100'),

  query('sortBy').custom((value, { req }) => {
    const query = req.query as Record<string, any>;

    if (
      value &&
      !['id', 'user_id', 'status', 'total_amount', 'created_at', 'voided_at'].includes(value)
    ) {
      throw new Error('sortBy must be a valid field name');
    }

    if (value && !query.sortDirection) {
      throw new Error('sortDirection is required when sortBy is provided');
    }

    return true;
  }),

  query('sortDirection')
    .optional({ checkFalsy: true })
    .isIn(['ASC', 'DESC'])
    .withMessage('sortDirection must be ASC or DESC')
    .custom((value, { req }) => {
      const query = req.query as Record<string, any>;

      if (value && !query.sortBy) {
        throw new Error('sortBy is required when sortDirection is provided');
      }

      return true;
    }),

  // filterField: must be one of the allowed values if provided
  query('filterField')
    .optional({ checkFalsy: true })
    .isIn(['user_id', 'status', 'total_amount', 'created_at', 'voided_at'])
    .withMessage('filterField must be one of user_id, status, total_amount, created_at, voided_at')
    .custom((value, { req }) => {
      const query = req.query as Record<string, any>;
      if (value) {
        if (['user_id', 'status'].includes(value) && !query.filter) {
          throw new Error(`filter is required when filterField is ${value}`);
        }
        if (value === 'total_amount' && !query.minTotalAmount && !query.maxTotalAmount) {
          throw new Error(
            'minTotalAmount or maxTotalAmount is required when filterField is total_amount'
          );
        }
        if (['created_at', 'voided_at'].includes(value) && !query.startDate && !query.endDate) {
          throw new Error(
            'startDate or endDate is required when filterField is created_at or voided_at'
          );
        }
      }
      return true;
    }),

  // filter: required and validated if filterField is id, user_id, or status
  query('filter')
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      const query = req.query as Record<string, any>;
      const filterField = query.filterField;
      if (['user_id', 'status'].includes(filterField)) {
        if (!value) throw new Error(`filter is required when filterField is ${filterField}`);

        if (filterField === 'status') {
          if (value !== 'completed' && value !== 'voided') {
            throw new Error('Status filter must be "completed" or "voided"');
          }
        } else {
          if (isNaN(Number(value))) {
            throw new Error('Filter must be a number for this filterField');
          }
        }
      }
      return true;
    }),

  // minTotalAmount: required if filterField is total_amount, must be a non-negative float
  query('minTotalAmount')
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      const query = req.query as Record<string, any>;
      if (query.filterField === 'total_amount') {
        if (!value && !query.maxTotalAmount) {
          throw new Error(
            'At least one of minTotalAmount or maxTotalAmount is required when filterField is total_amount'
          );
        }
      }
      if (value && (isNaN(Number(value)) || Number(value) < 0)) {
        throw new Error('minTotalAmount must be a non-negative number');
      }
      // max 2 decimals
      if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
        throw new Error('minTotalAmount can have at most 2 decimal places');
      }
      const ONE_BILLION = 1_000_000_000;
      if (value && Number(value) > ONE_BILLION - 0.01) {
        throw new Error('minTotalAmount must not exceed 999999999.99');
      }
      return true;
    }),

  // maxTotalAmount: required if filterField is total_amount, must be a non-negative float
  query('maxTotalAmount')
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      const query = req.query as Record<string, any>;
      if (query.filterField === 'total_amount') {
        if (!value && !query.minTotalAmount) {
          throw new Error(
            'At least one of minTotalAmount or maxTotalAmount is required when filterField is total_amount'
          );
        }
      }
      if (value && (isNaN(Number(value)) || Number(value) < 0)) {
        throw new Error('maxTotalAmount must be a non-negative number');
      }
      // max 2 decimals
      if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
        throw new Error('maxTotalAmount can have at most 2 decimal places');
      }
      const ONE_BILLION = 1_000_000_000;
      if (value && Number(value) > ONE_BILLION - 0.01) {
        throw new Error('maxTotalAmount must not exceed 999999999.99');
      }
      // minTotalAmount <= maxTotalAmount
      if (value && query.minTotalAmount && Number(query.minTotalAmount) > Number(value)) {
        throw new Error('minTotalAmount cannot be greater than maxTotalAmount');
      }
      return true;
    }),

  // startDate: required if filterField is created_at or voided_at, must be a valid date
  // todo validate startDate in controller get date of the first time a user was created in a store and set that as valid start date
  query('startDate')
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      const query = req.query as Record<string, any>;
      if (['created_at', 'voided_at'].includes(query.filterField)) {
        if (!value && !query.endDate) {
          throw new Error(
            'At least one of startDate or endDate is required when filterField is created_at or voided_at'
          );
        }
      }
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error('startDate must be in yyyy-mm-dd format');
      }

      // Ensure startDate is a reasonable date (not before year 1900)
      if (value && new Date(value).getFullYear() < 1900) {
        throw new Error('startDate must be after year 1900');
      }

      // Ensure startDate is not in the future
      if (value && new Date(value) > new Date()) {
        throw new Error('startDate cannot be in the future');
      }

      return true;
    }),

  // todo validate endDate in controller get date of the first time a user was created in a store and set that as valid start date
  // endDate: required if filterField is created_at or voided_at, must be a valid date
  query('endDate')
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      const query = req.query as Record<string, any>;
      if (['created_at', 'voided_at'].includes(query.filterField)) {
        if (!value && !query.startDate) {
          throw new Error(
            'At least one of startDate or endDate is required when filterField is created_at or voided_at'
          );
        }
      }
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error('endDate must be in yyyy-mm-dd format');
      }

      // Ensure startDate is a reasonable date (not before year 1900)
      if (value && new Date(value).getFullYear() < 1900) {
        throw new Error('startDate must be after year 1900');
      }

      if (value && new Date(value) > new Date()) {
        throw new Error('endDate cannot be in the future');
      }

      // endDate >= startDate
      if (value && query.startDate && value < query.startDate) {
        throw new Error('endDate cannot be earlier than startDate');
      }
      return true;
    }),

  // If filterField is not provided but any filter, min/maxTotalAmount, or start/endDate is present, require filterField
  query('filterField').custom((value, { req }) => {
    const query = req.query as Record<string, any>;
    if (
      !value &&
      (query.filter ||
        query.minTotalAmount ||
        query.maxTotalAmount ||
        query.startDate ||
        query.endDate)
    ) {
      throw new Error(
        'filterField is required when using filter, minTotalAmount, maxTotalAmount, startDate, or endDate'
      );
    }
    return true;
  }),
];

export const retrieveOneSalesValidator = [
  param('id')
    .notEmpty()
    .withMessage('Sale id is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Sale id must be a positive integer')
    .toInt(),
];

// todo validate on controllers if product id is valid
export const addSalesValidator = [
  body('salesItems').isArray({ min: 1 }).withMessage('salesItems must be a non-empty array'),

  body('salesItems.*.productId')
    .notEmpty()
    .withMessage('productId is required')
    .isInt({ min: 1 })
    .withMessage('productId must be a positive integer'),

  body('salesItems.*.quantity')
    .notEmpty()
    .withMessage('quantity is required')
    .isInt({ min: 1 })
    .withMessage('quantity must be a positive integer'),

  body('salesItems.*.price')
    .notEmpty()
    .withMessage('price is required')
    .isFloat({ min: 0 })
    .withMessage('price must be a non-negative number')
    .custom(value => {
      if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
        throw new Error('price can have at most 2 decimal places');
      }
      return true;
    }),
];

export const voidSalesValidator = [
  param('id')
    .notEmpty()
    .withMessage('Sale id is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Sale id must be a positive integer')
    .toInt(),
];
