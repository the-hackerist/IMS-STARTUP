import { RequestHandler } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

import connection from '../config/db';
import { Product } from '../types/product.types';
import { AppError } from '../utils/AppError';
import { RequestParamsProducts } from '../types/dto.types';

// review basic validations
// review isolate interfaces/types to a declaration file
// review main function
// review send response
// review error handling

export const retrieveAllProducts: RequestHandler = async (req, res, next) => {
  try {
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM products');

    if (!rows.length) throw new AppError('Product list is empty', 404);

    res.status(200).json({ msg: 'success! retrieved all products', data: rows });
  } catch (error) {
    next(error);
  }
};

export const retrieveOneProduct: RequestHandler = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE productId = ?',
      [productId]
    );

    if (!rows.length) throw new AppError('Product list is empty', 404);

    res.status(200).json({ msg: 'success! retrieved one product', data: rows });
  } catch (error) {
    next(error);
  }
};

export const addProduct: RequestHandler<{}, any, Product> = async (req, res, next) => {
  try {
    // review missing required fields, empty string after trim()
    // review limit max char length

    const { name, description, quantity, price } = req.body;

    const safeDescription: string | null = description ?? null;

    // todo don't allow duplicate items

    // review sql injection attacks

    let [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO products (name,description,quantity,price) VALUES (?,?,?,?)`,
      [name, safeDescription, quantity, price]
      // review nullish coalescing, replaces only null/undefined
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! added a product', data: req.body });
  } catch (error) {
    next(error);
  }
};

export const updateProduct: RequestHandler<RequestParamsProducts, any, Product> = async (
  req,
  res,
  next
) => {
  try {
    const { productId } = req.params;
    const { name, price, quantity, description } = req.body;

    const safeDescription: string | null = description ?? null;

    // review id does not exist
    // todo empty update body not allowed, may overwrite values with undefined
    // todo partial update handling
    // todo check if user input actually changed something, updating to same value, use result.changedRows === 0
    // review race conditions (2 clients updating the same record simultaneously)

    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE products SET name = ?, price = ?, quantity = ?, description = ? WHERE productId = ? ',
      [name, price, quantity, safeDescription, productId]
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! updated a product', data: req.body });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct: RequestHandler<RequestParamsProducts> = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // review id does not exist
    // todo client deletes twice

    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM products WHERE productId =?',
      [productId]
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! deleted a product' });
  } catch (error) {
    next(error);
  }
};
