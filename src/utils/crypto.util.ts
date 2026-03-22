import * as bcrypt from 'bcrypt';

export const validateHash = (password: string, hash: string): boolean => {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compareSync(password, hash);
};

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

export function generateUniqueCode({
  prefix = '',
  length = 8,
  uppercase = true,
}: {
  prefix?: string;
  length?: number;
  uppercase?: boolean;
} = {}): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return prefix + (uppercase ? result.toUpperCase() : result);
}
