import { applyDecorators } from '@nestjs/common';
import {
  IsString,
  IsNotEmpty,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { REGEX } from '../utils/regex.util';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStringField(message: string = 'Phải là chuỗi ký tự') {
  return applyDecorators(IsString({ message }));
}

export function IsNotEmptyField(message: string = 'Không được để trống') {
  return applyDecorators(IsNotEmpty({ message }));
}

export function IsMinLengthField(min: number, message?: string) {
  return applyDecorators(MinLength(min, { message }));
}

export function IsMaxLengthField(max: number, message?: string) {
  return applyDecorators(MaxLength(max, { message }));
}

export function IsPhoneNumberField(
  message: string = 'Số điện thoại chỉ được chứa số',
) {
  return applyDecorators(Matches(REGEX.PHONE_NUMBER, { message }));
}

export function IsDateCustom(
  options: { format: string },
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateCustom',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === undefined || value === null) {
            return true;
          }

          if (typeof value !== 'string') {
            return false;
          }

          if (options.format === 'HH:mm:ss') {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
            return timeRegex.test(value);
          }

          if (options.format === 'HH:mm') {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            return timeRegex.test(value);
          }

          if (options.format === 'YYYY-MM-DD') {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(value)) {
              return false;
            }
            const date = new Date(value);
            return !isNaN(date.getTime());
          }

          if (options.format === 'YYYY-MM-DD HH:mm:ss') {
            const datetimeRegex =
              /^\d{4}-\d{2}-\d{2} ([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
            if (!datetimeRegex.test(value)) {
              return false;
            }
            const date = new Date(value);
            return !isNaN(date.getTime());
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const format = options.format;
          return `${args.property} phải có định dạng ${format}`;
        },
      },
    });
  };
}
