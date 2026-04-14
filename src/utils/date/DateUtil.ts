import { TZDate } from '@date-fns/tz';
import {
    add,
    compareAsc,
    differenceInCalendarDays,
    differenceInCalendarMonths,
    differenceInCalendarYears,
    differenceInHours,
    differenceInSeconds,
    Duration,
    endOfDay,
    format,
    isLeapYear,
    isValid,
    parse,
    startOfDay,
} from 'date-fns';
import { IllegalArgumentException } from '../../exceptions';

/**
 * Utility class for date and time operations. Provides methods for parsing,
 * formatting, and performing calculations with dates and times.
 */
export class DateUtil {

    static readonly ISO_8601_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";
    static readonly DEFAULT_TIMEZONE = 'UTC';

    protected static resolveTimeZone(timeZone?: string): string {
        return timeZone || this.DEFAULT_TIMEZONE;
    }

    protected static normalizeDate(date: Date | number): Date {
        return typeof date === 'number' ? new Date(date) : date;
    }

    protected static toTZDate(date: Date | number, timeZone?: string): TZDate {
        return new TZDate(this.normalizeDate(date), this.resolveTimeZone(timeZone));
    }

    /**
     * Gets the current date and time in the specified time zone.
     * @param timeZone The IANA time zone identifier (default: UTC).
     * @returns Current date and time in the specified time zone.
     */
    static now(timeZone?: string): Date {
        return new TZDate(new Date(), this.resolveTimeZone(timeZone));
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
     * @param timeZone The IANA time zone identifier (default: UTC).
     * @throws {IllegalArgumentException} If the date string is invalid.
     * @returns Parsed Date object.
     */
    static readDate(dateString: string, dateFormat: string = this.ISO_8601_FORMAT, timeZone?: string): Date {
        const date = parse(dateString, dateFormat, TZDate.tz(this.resolveTimeZone(timeZone)));
        if (!isValid(date)) {
            throw new IllegalArgumentException('Invalid date string or date format');
        }
        return date;
    }

    /**
     * Formats a Date or timestamp into a string.
     * @param date The date or timestamp to format.
     * @param timeZone The IANA time zone identifier (default: UTC).
     * @param dateFormat The desired output format (default: ISO_8601_FORMAT).
     * @returns Formatted date string.
     */
    static printDate(date: Date, timeZone?: string, dateFormat?: string): string;
    static printDate(date: number, timeZone?: string, dateFormat?: string): string;
    static printDate(date: Date | number, timeZone?: string, dateFormat: string = this.ISO_8601_FORMAT): string {
        return format(this.toTZDate(date, timeZone), dateFormat);
    }

    /**
     * Gets the start of the day for a given date or timestamp.
     * @param date The date or timestamp to calculate from.
     * @param timeZone The IANA time zone identifier (default: UTC).
     * @returns The start of the day as a Date object.
     */
    static getStartOfDay(date: Date, timeZone?: string): Date;
    static getStartOfDay(date: number, timeZone?: string): Date;
    static getStartOfDay(date: Date | number, timeZone?: string): Date {
        return startOfDay(this.toTZDate(date, timeZone));
    }

    /**
     * Gets the end of the day for a given date or timestamp.
     * @param date The date or timestamp to calculate from.
     * @param timeZone The IANA time zone identifier (default: UTC).
     * @returns The end of the day as a Date object.
     */
    static getEndOfDay(date: Date, timeZone?: string): Date;
    static getEndOfDay(date: number, timeZone?: string): Date;
    static getEndOfDay(date: Date | number, timeZone?: string): Date {
        return endOfDay(this.toTZDate(date, timeZone));
    }

    /**
     * Checks if a date string is valid according to the specified format.
     * @param dateString The date string to validate.
     * @param dateFormat Optional date format (default: ISO_8601_FORMAT).
     * @param timeZone Optional IANA time zone identifier (default: UTC).
     * @returns True if the date is valid, false otherwise.
     */
    static isValidDate(dateString: string, dateFormat: string = this.ISO_8601_FORMAT, timeZone?: string): boolean {
        try {
            this.readDate(dateString, dateFormat, timeZone);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Calculates the absolute number of calendar days between two dates or timestamps.
     * Since day boundaries depend on a calendar, callers can optionally provide a time zone
     * so the same pair of instants is interpreted consistently across machines.
     *
     * @param firstDate The first date or timestamp.
     * @param secondDate The second date or timestamp.
     * @param timeZone Optional IANA time zone identifier used for calendar comparisons.
     * @returns Number of days between the two dates.
     */
    static daysInBetween(firstDate: Date, secondDate: Date, timeZone?: string): number;
    static daysInBetween(firstDate: number, secondDate: number, timeZone?: string): number;
    static daysInBetween(firstDate: Date | number, secondDate: Date | number, timeZone?: string): number {
        return Math.abs(
            differenceInCalendarDays(
                this.toTZDate(firstDate, timeZone),
                this.toTZDate(secondDate, timeZone),
            )
        );
    }

    /**
     * Calculates the absolute number of calendar months between two dates or timestamps.
     * Since month boundaries depend on a calendar, callers can optionally provide a time zone
     * so the same pair of instants is interpreted consistently across machines.
     *
     * @param firstDate The first date or timestamp.
     * @param secondDate The second date or timestamp.
     * @param timeZone Optional IANA time zone identifier used for calendar comparisons.
     * @returns The number of months between the two dates.
     */
    static monthsInBetween(firstDate: Date, secondDate: Date, timeZone?: string): number;
    static monthsInBetween(firstDate: number, secondDate: number, timeZone?: string): number;
    static monthsInBetween(firstDate: Date | number, secondDate: Date | number, timeZone?: string): number {
        return Math.abs(
            differenceInCalendarMonths(
                this.toTZDate(firstDate, timeZone),
                this.toTZDate(secondDate, timeZone),
            )
        );
    }

    /**
     * Calculates the absolute number of calendar years between two dates or timestamps.
     * Since year boundaries depend on a calendar, callers can optionally provide a time zone
     * so the same pair of instants is interpreted consistently across machines.
     *
     * @param firstDate The first date or timestamp.
     * @param secondDate The second date or timestamp.
     * @param timeZone Optional IANA time zone identifier used for calendar comparisons.
     * @returns The number of years between the two dates.
     */
    static yearsInBetween(firstDate: Date, secondDate: Date, timeZone?: string): number;
    static yearsInBetween(firstDate: number, secondDate: number, timeZone?: string): number;
    static yearsInBetween(firstDate: Date | number, secondDate: Date | number, timeZone?: string): number {
        return Math.abs(
            differenceInCalendarYears(
                this.toTZDate(firstDate, timeZone),
                this.toTZDate(secondDate, timeZone),
            )
        );
    }

    /**
     * Calculates the absolute elapsed number of hours between two dates or timestamps.
     * This is duration-based, not calendar-based, so it is independent of time zone.
     *
     * @param firstDate The first date or timestamp.
     * @param secondDate The second date or timestamp.
     * @returns The number of hours between the two dates.
     */
    static hoursInBetween(firstDate: Date, secondDate: Date): number;
    static hoursInBetween(firstDate: number, secondDate: number): number;
    static hoursInBetween(firstDate: Date | number, secondDate: Date | number): number {
        return Math.abs(differenceInHours(this.normalizeDate(firstDate), this.normalizeDate(secondDate)));
    }

    /**
     * Calculates the absolute elapsed number of seconds between two dates or timestamps.
     * This is duration-based, not calendar-based, so it is independent of time zone.
     *
     * @param firstDate The first date or timestamp.
     * @param secondDate The second date or timestamp.
     * @returns The number of seconds between the two dates.
     */
    static secondsInBetween(firstDate: Date, secondDate: Date): number;
    static secondsInBetween(firstDate: number, secondDate: number): number;
    static secondsInBetween(firstDate: Date | number, secondDate: Date | number): number {
        return Math.abs(differenceInSeconds(this.normalizeDate(firstDate), this.normalizeDate(secondDate)));
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
        return compareAsc(this.normalizeDate(firstDate), this.normalizeDate(secondDate)) as -1 | 0 | 1;
    }

    /**
     * Adds a duration (e.g., days, months, years) to a given date or timestamp.
     * When a time zone is provided, the duration is applied using calendar arithmetic
     * in that time zone so month-end or day-boundary business rules stay aligned locally.
     *
     * @param date The base date or timestamp to which the duration will be added.
     * @param duration An object specifying the duration (e.g., `{ days: 1, months: 2 }`).
     * @param timeZone Optional IANA time zone identifier used for calendar math.
     * @returns A new Date object with the duration added.
     */
    static addDuration(date: Date, duration: Duration, timeZone?: string): Date;
    static addDuration(date: number, duration: Duration, timeZone?: string): Date;
    static addDuration(date: Date | number, duration: Duration, timeZone?: string): Date {
        return add(this.toTZDate(date, timeZone), duration);
    }

    /**
     * Determines whether a given year is a leap year.
     * @param year The year to check.
     * @returns `true` if the year is a leap year, otherwise `false`.
     */
    static isLeapYear(year: number): boolean {
        return isLeapYear(this.readDate(year.toString(), 'yyyy'));
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
