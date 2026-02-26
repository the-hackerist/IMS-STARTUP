import { NextFunction, Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

import connection from '../config/db';

interface Product {
  name: string;
  quantity: number;
  description: string;
  price: number;
}

interface InventoryParams {
  productId: number;
}

// TODO isolate interfaces/types to a declaration file
// TODO main function
// TODO send response
// TODO validate
// TODO error handling

export async function retrieveAllProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM products');

    if (rows.length) throw Error;

    res.status(200).json({ msg: 'success! retrieved all products', data: rows });
  } catch (error) {
    // pass to centralized error handler, next(error)
    res.status(500).json({ msg: 'failed! unable to retrieve all products' });
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

    if (!rows.length) throw Error;

    res.status(200).json({ msg: 'success! retrieved one product', data: rows });
  } catch (error) {
    // pass to centralized error handler, next(error)
    res.status(500).json({ msg: 'failed! unable to retrieve one product' });
  }
}

export async function addProduct(req: Request<{}, {}, Product>, res: Response) {
  try {
    const { name, description, quantity, price } = req.body;

    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO product (name,description,quantity,price) VALUES (?,?,?,?)',
      [name, description, quantity, price]
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! added a product', data: req.body });
  } catch (error) {
    // pass to centralized error handler, next(error)
    res.status(500).json({ msg: 'failed! unable to add product' });
  }
}

export async function updateProduct(req: Request<InventoryParams, {}, Product>, res: Response) {
  try {
    const { productId } = req.params;
    const { name, price, quantity, description } = req.body;

    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE products SET name = ?, price = ?, quantity = ?, description = ? WHERE productId = ? ',
      [name, price, quantity, description, productId]
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! updated a product', data: req.body });
  } catch (error) {
    // pass to centralized error handler, next(error)
    res.status(500).json({ msg: 'failed! unable to update product' });
  }
}

export async function deleteProduct(req: Request<InventoryParams>, res: Response) {
  try {
    const { productId } = req.params;

    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM products WHERE productId =?',
      [productId]
    );

    if (!result.affectedRows) throw Error;

    res.status(200).json({ msg: 'success! deleted a product' });
  } catch (error) {
    // pass to centralized error handler, next(error)
    res.status(500).json({ msg: 'failed! unable to update product' });
  }
}
