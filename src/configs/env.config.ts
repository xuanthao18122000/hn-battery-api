import 'dotenv/config';

type Parser<T> = (value: string | undefined) => T;

export const booleanParser: Parser<boolean> = (value: string | undefined) => {
  if (value === undefined) return false;
  return value.toLowerCase() === 'true';
};

export const getEnv = <T>(
  key: string,
  parser: Parser<T> = String as unknown as Parser<T>,
): T => {
  if (parser === (booleanParser as unknown as Parser<T>)) {
    return booleanParser(process.env[key]) as T;
  }
  return parser(process.env[key]);
};
