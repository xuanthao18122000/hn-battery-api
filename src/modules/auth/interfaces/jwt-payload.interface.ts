export interface JwtPayload {
  sub: number;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  loginAt?: Date;
}
