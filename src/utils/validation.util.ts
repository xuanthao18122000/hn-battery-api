export const isUpperCase = (str: string): boolean => {
  return str === str.toUpperCase();
};

export const isLowerCase = (str: string): boolean => {
  return str === str.toLowerCase();
};

export const hasUpperCase = (str: string): boolean => {
  return /[A-Z]/.test(str);
};

export const hasLowerCase = (str: string): boolean => {
  return /[a-z]/.test(str);
};
