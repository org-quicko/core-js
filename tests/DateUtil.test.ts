import { describe } from "@jest/globals";
import { Duration } from "date-fns";
import { IllegalArgumentException } from "../src/exceptions";
import { DateUtil } from "../src/utils/date";

describe("DateUtil", () => {

	const TIMEZONE_UTC = "UTC";
	describe("now()", () => {
		it("should return the current date in UTC timezone", () => {
			const now = DateUtil.now(TIMEZONE_UTC);
			expect(now).toBeInstanceOf(Date);

			const currentUtcTime = new Date();
			const timeDifference = Math.abs(now.getTime() - currentUtcTime.getTime());
			// Allowing a difference of up to 1 second due to execution time
			expect(timeDifference).toBeLessThan(1000);
		});
	});

	describe("nowInMillis()", () => {
		it("should return the current time in milliseconds", () => {
			const millis = DateUtil.nowInMillis();
			const currentMillis = Date.now();
			expect(Math.abs(millis - currentMillis)).toBeLessThan(1000);
		});
	});

	describe("readDate()", () => {
		it("should parse valid date strings correctly", () => {
			const dateString = "2024-12-16T14:16:29.793Z";
			const date = DateUtil.readDate(dateString, undefined, TIMEZONE_UTC);
			expect(date).toBeInstanceOf(Date);
			expect(date.toISOString()).toBe("2024-12-16T14:16:29.793+00:00");
		});

		it("should parse valid date strings correctly if passed with timezone context", () => {
			const dateString = "2024-12-16T18:50:08.625-11:00";
			const date = DateUtil.readDate(dateString, undefined, TIMEZONE_UTC);
			expect(date).toBeInstanceOf(Date);
			expect(date.toISOString()).toBe("2024-12-17T05:50:08.625+00:00");
		});

		it("should parse date strings with custom format correctly", () => {
			const dateString = "05-10-2023 10:20:30";
			const dateFormat = "dd-MM-yyyy HH:mm:ss";
			const date = DateUtil.readDate(dateString, dateFormat, TIMEZONE_UTC);
			expect(date).toBeInstanceOf(Date);
			expect(date.toISOString()).toBe("2023-10-05T10:20:30.000+00:00");
		});

		it("should throw IllegalArgumentException for invalid date strings", () => {
			const invalidDateString = "invalid-date-string";
			expect(() => DateUtil.readDate(invalidDateString, undefined, TIMEZONE_UTC)).toThrow(IllegalArgumentException);
		});
	});

	describe("printDate()", () => {
		it("should format date correctly using default format", () => {
			const date = new Date("2023-10-05T04:50:30.000Z");
			const formattedDate = DateUtil.printDate(date, TIMEZONE_UTC);
			expect(formattedDate).toBe("2023-10-05T04:50:30.000+00:00");
		});

		it("should format date correctly using custom format", () => {
			const date = new Date("2023-10-05T04:50:30.000Z");
			const dateFormat = "dd-MM-yyyy HH:mm:ss";
			const formattedDate = DateUtil.printDate(date, TIMEZONE_UTC, dateFormat);
			expect(formattedDate).toBe("05-10-2023 04:50:30");
		});
	});

	describe("getStartOfDay()", () => {
		it("should return start of the day in UTC timezone", () => {
			const date = new Date("2023-10-05T12:00:00.000Z");
			const startOfDay = DateUtil.getStartOfDay(date, TIMEZONE_UTC);
			expect(startOfDay.toISOString()).toBe("2023-10-05T00:00:00.000+00:00");
		});
	});

	describe("getEndOfDay()", () => {
		it("should return end of the day in UTC timezone", () => {
			const date = new Date("2023-10-05T12:00:00.000Z");
			const endOfDay = DateUtil.getEndOfDay(date, TIMEZONE_UTC);
			expect(endOfDay.toISOString()).toBe("2023-10-05T23:59:59.999+00:00");
		});
	});

	describe("isValidDate()", () => {
		it("should return true for valid date strings", () => {
			const validDateString = "2023-10-05T10:20:30.000+00:00";
			const isValid = DateUtil.isValidDate(validDateString);
			expect(isValid).toBe(true);
		});

		it("should return false for invalid date strings", () => {
			const invalidDateString = "invalid-date-string";
			const isValid = DateUtil.isValidDate(invalidDateString);
			expect(isValid).toBe(false);
		});
	});

	describe("daysInBetween()", () => {
		it("should return correct number of days between dates", () => {
			const date1 = new Date("2023-10-01T00:00:00Z");
			const date2 = new Date("2023-10-05T00:00:00Z");
			const days = DateUtil.daysInBetween(date1, date2);
			expect(days).toBe(4);
		});
	});

	describe("monthsInBetween()", () => {
		it("should return correct number of months between dates", () => {
			const date1 = new Date("2023-01-01T00:00:00Z");
			const date2 = new Date("2023-04-01T00:00:00Z");
			const months = DateUtil.monthsInBetween(date1, date2);
			expect(months).toBe(3);
		});
	});

	describe("yearsInBetween()", () => {
		it("should return correct number of years between dates", () => {
			const date1 = new Date("2020-01-01T00:00:00Z");
			const date2 = new Date("2023-01-01T00:00:00Z");
			const years = DateUtil.yearsInBetween(date1, date2);
			expect(years).toBe(3);
		});
	});

	describe("compareDates()", () => {
		it("should return -1 if first date is earlier", () => {
			const date1 = new Date("2023-10-01T00:00:00Z");
			const date2 = new Date("2023-10-05T00:00:00Z");
			const result = DateUtil.compareDates(date1, date2);
			expect(result).toBe(-1);
		});

		it("should return 0 if dates are equal", () => {
			const date1 = new Date("2023-10-05T00:00:00Z");
			const date2 = new Date("2023-10-05T00:00:00Z");
			const result = DateUtil.compareDates(date1, date2);
			expect(result).toBe(0);
		});

		it("should return 1 if first date is later", () => {
			const date1 = new Date("2023-10-10T00:00:00Z");
			const date2 = new Date("2023-10-05T00:00:00Z");
			const result = DateUtil.compareDates(date1, date2);
			expect(result).toBe(1);
		});
	});

	describe("addDuration()", () => {
		it("should add duration to date correctly", () => {
			const date = new Date("2023-10-05T00:00:00Z");
			const duration: Duration = { days: 5, months: 1, years: 0 };
			const newDate = DateUtil.addDuration(date, duration);
			expect(newDate.toISOString()).toBe("2023-11-10T00:00:00.000Z");
		});
	});

	describe("isLeapYear()", () => {
		it("should return true for leap years", () => {
			expect(DateUtil.isLeapYear(2020)).toBe(true);
		});

		it("should return false for non-leap years", () => {
			expect(DateUtil.isLeapYear(2021)).toBe(false);
		});
	});

	describe("fromMillis()", () => {
		it("should return Date object representing the timestamp", () => {
			const millis = 1609459200000; // 2021-01-01T00:00:00Z
			const date = DateUtil.fromMillis(millis);
			expect(date.toISOString()).toBe("2021-01-01T00:00:00.000Z");
		});
	});

	describe("toMillis()", () => {
		it("should return timestamp in milliseconds", () => {
			const date = new Date("2021-01-01T00:00:00Z");
			const millis = DateUtil.toMillis(date);
			expect(millis).toBe(1609459200000);
		});
	});
});
