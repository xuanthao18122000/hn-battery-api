import * as moment from 'moment';
import { DATE_DB_FORMAT, DATETIME_FORMAT } from 'src/constants';

export const formatDate = (
  date?: string | Date | moment.Moment,
  format = DATE_DB_FORMAT,
) => {
  if (!date) return null;

  const dateAsMoment = moment(date, format);
  return dateAsMoment.isValid() ? dateAsMoment.format(format) : null;
};

export const formatSpecificDate = ({
  date,
  currentFormat,
  newFormat,
}: {
  date: string | Date | moment.Moment;
  currentFormat: string;
  newFormat: string;
}) => {
  const dateAsMoment = moment(date, currentFormat);
  return dateAsMoment.isValid() ? dateAsMoment.format(newFormat) : null;
};

export const getCurrentTimeAsString = (format = DATETIME_FORMAT): string => {
  return moment().format(format);
};

/**
 * Get current date with added seconds
 * @param {number} seconds - Number of seconds to add (default: 0)
 * @returns {Date} Current date with added seconds
 */
export const getCurrentDateWithSeconds = (seconds: number = 0): Date => {
  const date = new Date();
  date.setSeconds(date.getSeconds() + seconds);
  return date;
};

/**
 * Get current date
 * @returns {Date} Current date
 */
export const getCurrentDate = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const getDateWithAddedDays = (
  days: number,
  fromDate: Date = new Date(),
): Date => {
  return moment(fromDate).add(days, 'days').toDate();
};

export const getCurrentDateWithTime = (): Date => {
  const now = new Date();
  return now;
};

export const getStartOfMonth = (
  date: Date | string = new Date(),
  format = DATE_DB_FORMAT,
): string => {
  return moment(date).startOf('month').format(format);
};

export const getEndOfMonth = (
  date?: Date | string,
  format = DATE_DB_FORMAT,
): string => {
  return moment(date).endOf('month').format(format);
};

export const getStartOfDay = (
  date: Date | string | moment.Moment = new Date(),
  format = DATETIME_FORMAT,
): string => {
  return moment(date).startOf('day').format(format);
};

export const getEndOfDay = (
  date: Date | string = new Date(),
  format = DATETIME_FORMAT,
): string => {
  return moment(date).endOf('day').format(format);
};

export const getStartAndEndOfMonth = (
  month: number,
  year: number,
  format = DATETIME_FORMAT,
) => {
  const startDate = moment({ year, month: month - 1, day: 1 })
    .startOf('day')
    .format(format);
  const endDate = moment({ year, month: month - 1 })
    .endOf('month')
    .endOf('day')
    .format(format);
  return { startDate, endDate };
};

export const getPreviousMonthYear = (month: number, year: number) => {
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }
  return { month: prevMonth, year: prevYear };
};

export const calcPercentChange = (current: number, prev: number): number => {
  if (prev === 0 || prev === null || prev === undefined)
    return current > 0 ? 100 : 0;
  return ((current - prev) / prev) * 100;
};

/**
 * Get date with subtracted minutes
 * @param {number} minutes - Number of minutes to subtract
 * @param {Date | string | moment.Moment} fromDate - Starting date (default: current date)
 * @returns {Date} Date with subtracted minutes
 */
export const getDateWithSubtractedMinutes = (
  minutes: number,
  fromDate: Date | string | moment.Moment = new Date(),
): Date => {
  return moment(fromDate).subtract(minutes, 'minutes').toDate();
};
