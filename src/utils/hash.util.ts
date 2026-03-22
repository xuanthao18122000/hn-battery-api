import * as crypto from 'crypto';

/**
 * Hash a string using SHA-256
 * @param data - The string to hash
 * @returns The hashed string in hexadecimal format
 */
export const hashString = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};
