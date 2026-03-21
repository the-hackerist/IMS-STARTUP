import { ResultSetHeader, RowDataPacket } from 'mysql2';
import bcryptjs from 'bcryptjs';

import { RequestHandler, Response } from 'express';
import { AppError } from '../utils/AppError';
import { generateToken } from '../utils/jwt';
import connection from '../configs/db';

interface ApiResponseSuccess<T> {
  success?: boolean;
  message?: string;
  data?: T;
  status?: HttpStatusCodes;
}

enum HttpStatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

const BCRYPT_SALT = 12;
const hashPassword = (password: string) => bcryptjs.hashSync(password, BCRYPT_SALT);

export const sendResponse = <T>(
  res: Response,
  {
    success = true,
    message = 'Operation completed successfully',
    data,
    status = HttpStatusCodes.OK,
  }: ApiResponseSuccess<T> = {}
) => res.status(status).json({ success, message, data });

const safeProperty = <T>(property: T) => property ?? null;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

interface RetrieveUserQuery extends RowDataPacket {
  id: string;
  username?: string;
  email: string;
}

export const retrieveUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User ID not found', HttpStatusCodes.NOT_FOUND);

    const [rows] = await connection.execute<RetrieveUserQuery[]>(
      'SELECT id, email, username, store_id FROM users WHERE id = ?',
      [userId]
    );
    const user = rows[0];
    if (!user) throw new AppError('Invalid credentials', HttpStatusCodes.NOT_FOUND);

    sendResponse(res, { data: user });
  } catch (error) {
    next(error);
  }
};

type RegisterUserBody = { username?: string; email: string; password: string };

interface RegisterUserQuery extends RowDataPacket {
  email: string;
}

type RegisterUserResData = {
  id: number;
  email: string;
  storeId: number;
};

// Manual setting of store ID since there is no registration
const CURRENT_STORE_ID = 1;

export const registerUser: RequestHandler<any, any, RegisterUserBody> = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const [rows] = await connection.execute<RegisterUserQuery[]>(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];
    if (user) throw new AppError('Invalid credentials', HttpStatusCodes.CONFLICT);

    const hashedPassword = hashPassword(password);
    const safeUsername = safeProperty(username); // if theres no username provided then set value to null as undefined is not accepted in db
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO users (username,email,password,store_id) VALUES(?,?,?,?)',
      [safeUsername, email, hashedPassword, CURRENT_STORE_ID]
    );
    if (!result.affectedRows) throw new Error();

    const data: RegisterUserResData = { id: result.insertId, email, storeId: CURRENT_STORE_ID };
    sendResponse(res, { data, status: HttpStatusCodes.CREATED });
  } catch (error) {
    next(error);
  }
};

interface LoginUserQuery extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  username?: string;
}

type LoginUserBody = {
  email: string;
  password: string;
};

type LoginUserResData = {
  id: number;
  email: string;
  username?: string;
  token: string;
};

const validateHashedPassword = (hashedPassword: string, password: string) =>
  bcryptjs.compareSync(password, hashedPassword);

export const loginUser: RequestHandler<any, any, LoginUserBody> = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await connection.execute<LoginUserQuery[]>(
      'SELECT id,email,password,username,store_id FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];
    if (!user) throw new AppError('User not found', HttpStatusCodes.NOT_FOUND);

    const isPasswordValid = validateHashedPassword(user.password, password);
    if (!isPasswordValid) throw new AppError('Invalid credentials', HttpStatusCodes.BAD_REQUEST);

    const { password: pass, ...userDetails } = user;
    const token = generateToken(user.id);

    sendResponse<LoginUserResData>(res, {
      data: { ...userDetails, token },
    });
  } catch (error) {
    next(error);
  }
};
