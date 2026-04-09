import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Role } from '../types/enums';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  hospitalId: string | null;
}

export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);

export const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;

export const getRefreshTokenExpiresAt = (): Date => {
  const days = parseInt(config.JWT_REFRESH_EXPIRES_IN.replace('d', ''), 10) || 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
