import { Transform, TransformFnParams } from 'class-transformer';
import { DATE_DB_FORMAT, DATETIME_FORMAT } from '../constants';
import { Moment } from 'moment';
import { convertToBoolean } from 'src/utils';
import { formatDate, getEndOfDay, getStartOfDay } from 'src/helpers';

export const ToBooleanCustom = (): PropertyDecorator => {
  return Transform(({ value }: TransformFnParams) =>
    convertToBoolean(value as string),
  );
};

export const ToTrimCustom = (): PropertyDecorator => {
  return Transform(({ value }: TransformFnParams) => {
    return typeof value === 'string'
      ? value.trim()
      : (value as null | undefined);
  });
};

export const ToFormatDate = (format = DATE_DB_FORMAT): PropertyDecorator => {
  return Transform(({ value }: TransformFnParams) =>
    formatDate(value as string | Date | Moment | undefined, format),
  );
};

export const ToNumberCustom = (): PropertyDecorator => {
  return Transform(({ value }: TransformFnParams) => Number(value) || 0);
};

export const ToStartOfDay = (format = DATETIME_FORMAT): PropertyDecorator => {
  return Transform(({ value }: TransformFnParams) =>
    getStartOfDay(value as string | Date | Moment, format),
  );
};

export const ToEndOfDay = (format = DATETIME_FORMAT): PropertyDecorator => {
  return Transform(({ value }: TransformFnParams) =>
    getEndOfDay(value as string | Date, format),
  );
};
