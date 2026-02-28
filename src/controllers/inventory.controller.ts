import { NextFunction, Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

import connection from '../config/db';
import { AppError } from '../utils/AppError';

// TODO isolate interfaces/types to a declaration file
interface Product {
  name: string;
  quantity: number;
  description: string;
  price: number;
}

interface InventoryParams {
  productId: number;
}

// TODO validations
// review main function
// review send response
// review error handling

export async function retrieveAllProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM products');

    if (!rows.length) throw new AppError('Product list is empty', 404);

    res.status(200).json({ msg: 'success! retrieved all products', data: rows });
  } catch (error) {
    next(error);
  }
}

export async function retrieveOneProduct(
  req: Request<InventoryParams>,
  res: Response,
  next: NextFunction
) {
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
}

export async function addProduct(req: Request<{}, {}, Product>, res: Response, next: NextFunction) {
  try {
    const { name, description, quantity, price } = req.body;

    // todo check first if product already exists

    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO product (name,description,quantity,price) VALUES (?,?,?,?)',
      [name, description, quantity, price]
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! added a product', data: req.body });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(
  req: Request<InventoryParams, {}, Product>,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params;
    const { name, price, quantity, description } = req.body;

    // todo check first if product exists
    // todo check if user input actually changed something

    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE products SET name = ?, price = ?, quantity = ?, description = ? WHERE productId = ? ',
      [name, price, quantity, description, productId]
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! updated a product', data: req.body });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(
  req: Request<InventoryParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const { productId } = req.params;

    // todo check first if product exists

    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM products WHERE productId =?',
      [productId]
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! deleted a product' });
  } catch (error) {
    next(error);
  }
}
