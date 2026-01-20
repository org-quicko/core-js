import { TZDate } from '@date-fns/tz';
import { add, compareAsc, differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarYears, differenceInHours, differenceInSeconds, Duration, endOfDay, format, isLeapYear, isValid, parse, startOfDay } from 'date-fns';
import { IllegalArgumentException } from '../../exceptions';

/**
 * Utility class for date and time operations. Provides methods for parsing,
 * formatting, and performing calculations with dates and times.
 */
export class DateUtil {

    static readonly ISO_8601_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"

    /**
     * Gets the current date and time in the specified time zone.
     * @param timeZone The IANA time zone identifier.
     * @returns Current date and time in the specified time zone.
     */
    static now(timeZone: string): Date {
        return new TZDate(new Date(), timeZone);
    }

    /**
     * Gets the current time in milliseconds since the Unix epoch.
     * @returns Current time in milliseconds.
     */
    static nowInMillis(): number {
        return Date.now();
    }

    /**
     * Parses a date string into a Date object.
     * @param dateString The date string to parse.
     * @param dateFormat The format of the date string (default: ISO_8601_FORMAT).
     * @param timeZone The IANA time zone identifier.
     * @throws {IllegalArgumentException} If the date string is invalid.
     * @returns Parsed Date object.
     */
    static readDate(dateString: string, dateFormat = this.ISO_8601_FORMAT, timeZone: string): Date {
        const date = parse(dateString, dateFormat, TZDate.tz(timeZone));
        if (!isValid(date)) {
            throw new IllegalArgumentException('Invalid date string or date format');
        }
        return date;
    }

    /**
     * Formats a Date or timestamp into a string.
     * @param date The date or timestamp to format.
     * @param timeZone The IANA time zone identifier.
     * @param dateFormat The desired output format (default: ISO_8601_FORMAT).
     * @returns Formatted date string.
     */
    static printDate(date: Date, timeZone: string, dateFormat?: string): string;
    static printDate(date: number, timeZone: string, dateFormat?: string): string;
    static printDate(date: Date | number, timeZone: string, dateFormat: string = this.ISO_8601_FORMAT): string {
        const normalizedDate = typeof date === 'number' ? new Date(date) : date;
        return format(new TZDate(normalizedDate, timeZone), dateFormat);
    }

    /**
     * Gets the start of the day for a given date or timestamp.
     * @param date The date or timestamp to calculate from.
     * @param timeZone The IANA time zone identifier.
     * @returns The start of the day as a Date object.
     */
    static getStartOfDay(date: Date, timeZone: string): Date;
    static getStartOfDay(date: number, timeZone: string): Date;
    static getStartOfDay(date: Date | number, timeZone: string): Date {
        const normalizedDate = typeof date === 'number' ? new Date(date) : date;
        return startOfDay(new TZDate(normalizedDate, timeZone));
    }

    /**
     * Gets the end of the day for a given date or timestamp.
     * @param date The date or timestamp to calculate from.
     * @param timeZone The IANA time zone identifier.
     * @returns The end of the day as a Date object.
     */
    static getEndOfDay(date: Date, timeZone: string): Date;
    static getEndOfDay(date: number, timeZone: string): Date;
    static getEndOfDay(date: Date | number, timeZone: string): Date {
        const normalizedDate = typeof date === 'number' ? new Date(date) : date;
        return endOfDay(new TZDate(normalizedDate, timeZone));
    }

    /**
     * Checks if a date string is valid according to the specified format.
     * @param dateString The date string to validate.
     * @param dateFormat Optional date format (default: ISO_8601_FORMAT).
     * @returns True if the date is valid, false otherwise.
     */
    static isValidDate(dateString: string, dateFormat?: string): boolean {
        try {
            DateUtil.readDate(dateString, dateFormat, "UTC");
            return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return false;
        }
    }

    /**
     * Calculates the absolute number of days between two dates or timestamps.
     * @param firstDate The first date or timestamp.
     * @param secondDate The second date or timestamp.
     * @returns Number of days between the two dates.
     */
    static daysInBetween(firstDate: Date, secondDate: Date): number;
    static daysInBetween(firstDate: number, secondDate: number): number;
    static daysInBetween(firstDate: Date | number, secondDate: Date | number): number {
        const first = typeof firstDate === 'number' ? new Date(firstDate) : firstDate;
        const second = typeof secondDate === 'number' ? new Date(secondDate) : secondDate;
        return Math.abs(differenceInCalendarDays(first, second));
    }

    /**
 * Calculates the absolute number of months between two dates or timestamps.
 * @param firstDate The first date or timestamp.
 * @param secondDate The second date or timestamp.
 * @returns The number of months between the two dates.
 */
    static monthsInBetween(firstDate: Date, secondDate: Date): number;
    static monthsInBetween(firstDate: number, secondDate: number): number;
    static monthsInBetween(firstDate: Date | number, secondDate: Date | number): number {
        const first = typeof firstDate === 'number' ? new Date(firstDate) : firstDate;
        const second = typeof secondDate === 'number' ? new Date(secondDate) : secondDate;
        return Math.abs(differenceInCalendarMonths(first, second));
    }

    /**
     * Calculates the absolute number of years between two dates or timestamps.
     * @param firstDate The first date or timestamp.
     * @param secondDate The second date or timestamp.
     * @returns The number of years between the two dates.
     */
    static yearsInBetween(firstDate: Date, secondDate: Date): number;
    static yearsInBetween(firstDate: number, secondDate: number): number;
    static yearsInBetween(firstDate: Date | number, secondDate: Date | number): number {
        const first = typeof firstDate === 'number' ? new Date(firstDate) : firstDate;
        const second = typeof secondDate === 'number' ? new Date(secondDate) : secondDate;
        return Math.abs(differenceInCalendarYears(first, second));
    }

    /**
     * Calculates the absolute number of hours between two dates or timestamps.
     * @param firstDate The first date or timestamp.
     * @param secondDate The second date or timestamp.
     * @returns The number of hours between the two dates.
     */
    static hoursInBetween(firstDate: Date, secondDate: Date): number;
    static hoursInBetween(firstDate: number, secondDate: number): number;
    static hoursInBetween(firstDate: Date | number, secondDate: Date | number): number {
        const first = typeof firstDate === 'number' ? new Date(firstDate) : firstDate;
        const second = typeof secondDate === 'number' ? new Date(secondDate) : secondDate;
        return Math.abs(differenceInHours(first, second));
    }

    /**
     * Calculates the absolute number of seconds between two dates or timestamps.
     * @param firstDate The first date or timestamp.
     * @param secondDate The second date or timestamp.
     * @returns The number of seconds between the two dates.
     */
    static secondsInBetween(firstDate: Date, secondDate: Date): number;
    static secondsInBetween(firstDate: number, secondDate: number): number;
    static secondsInBetween(firstDate: Date | number, secondDate: Date | number): number {
        const first = typeof firstDate === 'number' ? new Date(firstDate) : firstDate;
        const second = typeof secondDate === 'number' ? new Date(secondDate) : secondDate;
        return Math.abs(differenceInSeconds(first, second));
    }

    /**
     * Compares two dates or timestamps.
     * @param firstDate The first date or timestamp.
     * @param secondDate The second date or timestamp.
     * @returns `-1` if the first date is earlier, `1` if it is later, or `0` if the two dates are equal.
     */
    static compareDates(firstDate: Date, secondDate: Date): -1 | 0 | 1;
    static compareDates(firstDate: number, secondDate: number): -1 | 0 | 1;
    static compareDates(firstDate: Date | number, secondDate: Date | number): -1 | 0 | 1 {
        const first = typeof firstDate === 'number' ? new Date(firstDate) : firstDate;
        const second = typeof secondDate === 'number' ? new Date(secondDate) : secondDate;

        return compareAsc(first, second) as -1 | 0 | 1;
    }

    /**
     * Adds a duration (e.g., days, months, years) to a given date or timestamp.
     * @param date The base date or timestamp to which the duration will be added.
     * @param duration An object specifying the duration (e.g., `{ days: 1, months: 2 }`).
     * @returns A new Date object with the duration added.
     */
    static addDuration(date: Date, duration: Duration): Date;
    static addDuration(date: number, duration: Duration): Date;
    static addDuration(date: Date | number, duration: Duration): Date {
        const normalizedDate = typeof date === 'number' ? new Date(date) : date;
        return add(normalizedDate, duration);
    }

    /**
     * Determines whether a given year is a leap year.
     * @param year The year to check.
     * @returns `true` if the year is a leap year, otherwise `false`.
     */
    static isLeapYear(year: number): boolean {
        return isLeapYear(DateUtil.readDate(year.toString(), 'yyyy', "UTC"));
    }


    /**
     * Converts a timestamp (in milliseconds) to a Date object.
     * @param milliseconds The timestamp in milliseconds since the Unix epoch.
     * @returns A Date object representing the provided timestamp.
     */
    static fromMillis(milliseconds: number): Date {
        return new Date(milliseconds);
    }

    /**
     * Converts a Date object to a timestamp (in milliseconds).
     * @param date The Date object to convert.
     * @returns The timestamp in milliseconds since the Unix epoch.
     */
    static toMillis(date: Date): number {
        return date.getTime();
    }
}
