import { body, param, query } from 'express-validator';

export const allowedFilters = ['store_id', 'name', 'stock_quantity', 'price', 'created_at'];
export const allowedSortBy = allowedFilters.filter(val => val !== 'store_id');
export const allowedSortDirection = ['ASC', 'DESC'];

export const retrieveAllProductsValidator = [
  query('page')
    .optional({ checkFalsy: true })
    .trim()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional({ checkFalsy: true })
    .trim()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('filterField')
    .if(query('filter').exists())
    .notEmpty()
    .withMessage('A filter field is required when a filter string is provided')
    .trim()
    .isIn(allowedFilters)
    .withMessage('The selected filter field is invalid')
    .isLength({ min: 1, max: 150 })
    .withMessage('Filter field must be between 1 and 150 characters'),

  query('filter')
    .if(query('filterField').exists())
    .notEmpty()
    .withMessage('A filter string is required when a filter field is provided')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('The filter string is too long'),

  query('sortBy')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(allowedSortBy)
    .withMessage('The selected sort field is invalid'),

  query('sortDirection')
    .optional({ checkFalsy: true })
    .trim()
    .isIn(allowedSortDirection)
    .withMessage('The selected sort field direction is invalid'),
];

export const retrieveOneProductValidator = [
  param('search')
    .notEmpty()
    .withMessage('A search string is required')
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('A search string must be between 3 and 150 characters'),

  query('field')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('A search field must be between 8 and 100 characters'),
];

export const addProductValidator = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Product name must be between 3-150 characters'),

  body('barcode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 100 })
    .withMessage('Product barcode must be between 8-100 characters'),

  body('stockQuantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .trim()
    .isInt({ min: 1 })
    .withMessage('Product quantity must be a positive integer')
    .toInt(),

  body('price')
    .notEmpty()
    .withMessage('Product price is required')
    .trim()
    .isDecimal({ decimal_digits: '2' })
    .withMessage('Product price must be a number with 2 decimals')
    // .isInt({ min: 1 })
    // .withMessage('Product price must be positive integer')
    .toInt(),
];

export const updateProductValidator = [
  param('productId')
    .notEmpty()
    .withMessage('Product id is required')
    .trim()
    .isInt({ min: 1 })
    .withMessage('Product id must be a positive integer')
    .toInt(),

  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Product name must be between 3-150 characters'),

  body('barcode')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 100 })
    .withMessage('Product barcode must be between 8-100 characters'),

  body('stockQuantity')
    .optional({ checkFalsy: true })
    .trim()
    .isInt({ min: 1 })
    .withMessage('Product quantity must be a positive integer')
    .toInt(),

  body('price')
    .optional({ checkFalsy: true })
    .trim()
    .isDecimal({ decimal_digits: '2' })
    .withMessage('Product price must be a number with 2 decimals')
    // .isInt({ min: 1 })
    // .withMessage('Product price must be positive integer')
    .toInt(),
];

export const deleteProductValidator = [
  param('productId')
    .notEmpty()
    .withMessage('Product id is required')
    .trim()
    .isInt({ min: 1 })
    .withMessage('Product id must be a positive integer')
    .toInt(),
];
