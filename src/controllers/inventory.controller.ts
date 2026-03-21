import { RequestHandler } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

import connection from '../configs/db';
import { Product } from '../types/product.types';
import { AppError } from '../utils/AppError';
import {
  ParamsProducts,
  ParamsRetrieveProducts,
  QueryProducts,
  QueryRetrieveProducts,
} from '../types/dto.types';

export const retrieveAllProducts: RequestHandler<any, any, {}, QueryRetrieveProducts> = async (
  req,
  res,
  next
) => {
  try {
    const { page, limit, filterField, filter, sortBy, sortDirection } = req.query;

    // CONSTANTS & HELPERS
    const DEFAULT_PAGE = 1;
    const DEFAULT_LIMIT = 10;
    const convertToZeroBasedIdx = (num: number) => num - 1;
    const isFilterExist = filter && filterField ? true : false;

    // PAGINATION
    const currPage = +page || DEFAULT_PAGE;
    const currLimit = +limit || DEFAULT_LIMIT;
    const offset = convertToZeroBasedIdx(currPage) * currLimit;

    // CONDITIONALLY GENERATE SQL QUERIES
    const sortQuery = `ORDER BY ${sortBy || 'created_at'} ${sortDirection || 'DESC'}`;
    const filterQuery = `WHERE ${filterField} LIKE ?`;
    const query = `SELECT * FROM products ${isFilterExist ? filterQuery : ''} ${sortBy ? sortQuery : ''}  LIMIT ? OFFSET ?`;

    // PARAMETERIZED VALUES ARRAY
    const parametrizedValues: (string | number)[] = [currLimit, offset];
    if (isFilterExist) parametrizedValues.unshift(`%${filter}%`);

    // GET TOTAL PAGES
    const [[{ total }]] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM products ${isFilterExist ? filterQuery : ''}`,
      isFilterExist ? [`%${filter}%`] : []
    );
    const totalPages = Math.ceil(total / currLimit);
    if (currPage > totalPages && totalPages > 0) throw new AppError('Page not found', 400);

    const [rows] = await connection.execute<RowDataPacket[]>(query, parametrizedValues);
    res.status(200).json({
      success: true,
      message: 'success! retrieved all products',
      data: {
        products: rows,
        pagination: {
          page: currPage,
          limit: currLimit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const retrieveOneProduct: RequestHandler<
  ParamsRetrieveProducts,
  any,
  {},
  QueryProducts
> = async (req, res, next) => {
  try {
    const { search } = req.params;
    const { field } = req.query;

    // RETRIEVE A PRODUCT BASED ON ALLOWED FIELD AND SEARCH STRING
    // SEARCH BY NAME, PRODUCT_ID, BARCODE
    // ALWAYS PRODUCE ONE DATA

    const parameterizedValues: (string | number)[] = [field === 'name' ? `%${search}%` : search];
    if (field === 'name') parameterizedValues.push(1);

    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM products ${field === 'name' ? `WHERE name LIKE` : `WHERE product_id =`} ? ${field === 'name' ? 'LIMIT ?' : ''}`,
      parameterizedValues
    );
    if (!rows.length) throw new AppError('Product does not exist', 404);

    res.status(200).json({ success: true, message: 'success! retrieved one product', data: rows });
  } catch (error) {
    next(error);
  }
};

export const addProduct: RequestHandler<{}, any, Product> = async (req, res, next) => {
  try {
    const { name, barcode, stockQuantity, price } = req.body;

    // MYSQL DB ONLY KNOWS NULL NOT UNDEFINED
    const safeBarcode: string | null = barcode ?? null;

    // CHECK FIRST IF PRODUCT ALREADY EXISTS
    const [isProductExist] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE name = ?',
      [name]
    );
    if (isProductExist.length > 0)
      throw new AppError('A product with this name already exists', 409);

    // INSERT NEW PRODUCT TO MYSQL DB
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO products (name,barcode,stock_quantity,price) VALUES (?,?,?,?)`,
      [name, safeBarcode, stockQuantity, price]
    );
    if (!result.affectedRows) throw Error;

    // RETRIEVE
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM products WHERE name = ?`,
      [name]
    );

    res.status(200).json({ success: true, message: 'success! added a product', data: rows });
  } catch (error) {
    next(error);
  }
};

export const updateProduct: RequestHandler<ParamsProducts, any, Partial<Product>> = async (
  req,
  res,
  next
) => {
  try {
    const { productId } = req.params;

    const [isProductExist] = await connection.execute<RowDataPacket[]>( // CHECK BY PRODUCT_ID IF PRODUCT ACTUALLY EXISTS IN THE DB
      'SELECT * FROM products WHERE product_id = ?', // READ QUERY
      [productId] // PARAMETERIZED VALUE
    );
    if (!isProductExist.length) throw new AppError('A product with this id was not found', 404); // NO DATA RETURNED SEND ERROR MSG

    // GENERATE A DYNAMIC QUERY BASED ON THE AVAILABLE QUERY FIELDS
    const allowedFields = ['name', 'price', 'stockQuantity', 'barcode'] as const; // MAKE THIS ARRAY IMMUTABLE AND TURN ELEMENTS TO LITERAL TYPES
    const updatedFields: string[] = []; // TO STORE AVAILABLE QUERY FIELDS AND USED TO GENERATE SET CLAUSE
    const updatedValues: (string | number | null)[] = []; // PARAMETERIZED VALUES OF AVAILABLE QUERY FIELDS
    // LOOP EACH FIELD, IF ITS NOT UNDEFINED THEN EXECUTE THIS CODE BLOCK
    for (const field of allowedFields) {
      const value = req.body[field]; // GET CURRENT QUERY FIELD  VALUE
      // CHECK IF IT HAS VALUE
      if (value !== undefined) {
        const column = field === 'stockQuantity' ? 'stock_quantity' : field; // USE CORRECT FIELD NAME IN DB
        updatedFields.push(`${column} = ?`); // PUSH SET SYNTAX TO UPDATED FIELDS ARRAY TO BE CONCATENATED
        updatedValues.push(value ?? null); // ANY VALUE THAT IS UNDEFINED OR NULL WILL BE STORED AS NULL
      }
    }
    if (!updatedFields.length) throw new AppError('No fields provided for update', 400); // NO QUERY FIELDS WAS SENT, SEND ERROR MSG
    updatedValues.push(productId); // PUSH PRODUCT ID AT THE END OF UPDATED VALUES ARRAY, CORRECT ORDER

    const query = `Update products SET ${updatedFields.join(', ')} WHERE product_id = ?`; // FINAL QUERY STRING
    const [result] = await connection.execute<ResultSetHeader>(query, updatedValues); // UPDATE PRODUCT
    if (result.affectedRows === 0) throw Error; // FAILED TO UPDATE PRODUCT, SEND ERROR MSG
    res.status(200).json({ success: true, message: 'success! updated a product', data: req.body }); // IF SUCCESS, SEND JSON
  } catch (error) {
    next(error); // PASS ERROR TO CENTRALIZED ERROR HANDLER
  }
};

export const deleteProduct: RequestHandler<ParamsProducts> = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // CHECK IF PRODUCT EXISTS
    const [isProductExist] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE product_id = ?',
      [productId]
    );
    if (isProductExist.length === 0)
      throw new AppError('A product with this id was not found', 404);

    // IF IT IS THEN DELETE
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM products WHERE product_id =?',
      [productId]
    );
    if (result.affectedRows === 0) throw Error;

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
