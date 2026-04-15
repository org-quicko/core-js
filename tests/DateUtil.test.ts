import { Duration } from "date-fns";
import { IllegalArgumentException } from "../src/exceptions";
import { DateUtil } from "../src/utils/date";
import { describe, it, expect } from "@jest/globals";

describe("DateUtil", () => {

	const TIMEZONE_UTC = "UTC";
	const TIMEZONE_IST = "Asia/Kolkata";
	describe("now()", () => {
		it("should return the current date in UTC timezone", () => {
			const now = DateUtil.now(TIMEZONE_UTC);
			expect(now).toBeInstanceOf(Date);

			const currentUtcTime = new Date();
			const timeDifference = Math.abs(now.getTime() - currentUtcTime.getTime());
			// Allowing a difference of up to 1 second due to execution time
			expect(timeDifference).toBeLessThan(1000);
		});

		it("should default to UTC timezone when timezone is omitted", () => {
			const now = DateUtil.now();
			expect(now).toBeInstanceOf(Date);

			const currentUtcTime = new Date();
			const timeDifference = Math.abs(now.getTime() - currentUtcTime.getTime());
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
		it("should parse valid date strings with UTC when timezone is omitted", () => {
			const dateString = "2024-12-16T14:16:29.793Z";
			const date = DateUtil.readDate(dateString);
			expect(date).toBeInstanceOf(Date);
			expect(date.toISOString()).toBe("2024-12-16T14:16:29.793+00:00");
		});

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
		it("should format date using UTC when timezone is omitted", () => {
			const date = new Date("2023-10-05T04:50:30.000Z");
			const formattedDate = DateUtil.printDate(date);
			expect(formattedDate).toBe("2023-10-05T04:50:30.000+00:00");
		});

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
		it("should return start of the day in UTC when timezone is omitted", () => {
			const date = new Date("2023-10-05T12:00:00.000Z");
			const startOfDay = DateUtil.getStartOfDay(date);
			expect(startOfDay.toISOString()).toBe("2023-10-05T00:00:00.000+00:00");
		});

		it("should return start of the day in UTC timezone", () => {
			const date = new Date("2023-10-05T12:00:00.000Z");
			const startOfDay = DateUtil.getStartOfDay(date, TIMEZONE_UTC);
			expect(startOfDay.toISOString()).toBe("2023-10-05T00:00:00.000+00:00");
		});
	});

	describe("getEndOfDay()", () => {
		it("should return end of the day in UTC when timezone is omitted", () => {
			const date = new Date("2023-10-05T12:00:00.000Z");
			const endOfDay = DateUtil.getEndOfDay(date);
			expect(endOfDay.toISOString()).toBe("2023-10-05T23:59:59.999+00:00");
		});

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

		it("should default to UTC calendar boundaries when timezone is omitted", () => {
			const date1 = new Date("2023-10-01T18:30:00.000Z");
			const date2 = new Date("2023-10-02T17:29:00.000Z");
			const days = DateUtil.daysInBetween(date1, date2);
			expect(days).toBe(1);
		});

		it("should use the provided timezone for calendar day boundaries", () => {
			const date1 = new Date("2023-10-01T18:30:00.000Z"); // 02 Oct 2023 00:00:00 IST
			const date2 = new Date("2023-10-02T17:29:00.000Z"); // 02 Oct 2023 22:59:00 IST
			const days = DateUtil.daysInBetween(date1, date2, TIMEZONE_IST);
			expect(days).toBe(0);
		});
	});

	describe("monthsInBetween()", () => {
		it("should return correct number of months between dates", () => {
			const date1 = new Date("2023-01-01T00:00:00Z");
			const date2 = new Date("2023-04-01T00:00:00Z");
			const months = DateUtil.monthsInBetween(date1, date2);
			expect(months).toBe(3);
		});

		it("should default to UTC calendar boundaries when timezone is omitted", () => {
			const date1 = new Date("2023-01-31T23:30:00.000Z");
			const date2 = new Date("2023-02-28T22:29:00.000Z");
			const months = DateUtil.monthsInBetween(date1, date2);
			expect(months).toBe(1);
		});

		it("should use the provided timezone for calendar month boundaries", () => {
			const date1 = new Date("2023-01-31T18:30:00.000Z"); // 01 Feb 2023 00:00:00 IST
			const date2 = new Date("2023-02-28T17:29:00.000Z"); // 28 Feb 2023 22:59:00 IST
			const months = DateUtil.monthsInBetween(date1, date2, TIMEZONE_IST);
			expect(months).toBe(0);
		});
	});

	describe("yearsInBetween()", () => {
		it("should return correct number of years between dates", () => {
			const date1 = new Date("2020-01-01T00:00:00Z");
			const date2 = new Date("2023-01-01T00:00:00Z");
			const years = DateUtil.yearsInBetween(date1, date2);
			expect(years).toBe(3);
		});

		it("should default to UTC calendar boundaries when timezone is omitted", () => {
			const date1 = new Date("2023-12-31T23:30:00.000Z");
			const date2 = new Date("2024-12-31T22:29:00.000Z");
			const years = DateUtil.yearsInBetween(date1, date2);
			expect(years).toBe(1);
		});

		it("should use the provided timezone for calendar year boundaries", () => {
			const date1 = new Date("2023-12-31T18:30:00.000Z"); // 01 Jan 2024 00:00:00 IST
			const date2 = new Date("2024-12-31T17:29:00.000Z"); // 31 Dec 2024 22:59:00 IST
			const years = DateUtil.yearsInBetween(date1, date2, TIMEZONE_IST);
			expect(years).toBe(0);
		});
	});

	describe("hoursInBetween()", () => {
		it("should return correct number of hours between dates", () => {
			const date1 = new Date("2023-10-01T00:00:00Z");
			const date2 = new Date("2023-10-01T12:00:00Z");
			const hours = DateUtil.hoursInBetween(date1, date2);
			expect(hours).toBe(12);
		});

		it("should return absolute value when first date is later", () => {
			const date1 = new Date("2023-10-01T18:00:00Z");
			const date2 = new Date("2023-10-01T06:00:00Z");
			const hours = DateUtil.hoursInBetween(date1, date2);
			expect(hours).toBe(12);
		});

		it("should return 0 for same timestamps", () => {
			const date1 = new Date("2023-10-01T12:00:00Z");
			const date2 = new Date("2023-10-01T12:00:00Z");
			const hours = DateUtil.hoursInBetween(date1, date2);
			expect(hours).toBe(0);
		});

		it("should work with timestamps (numbers)", () => {
			const date1 = new Date("2023-10-01T00:00:00Z").getTime();
			const date2 = new Date("2023-10-01T06:00:00Z").getTime();
			const hours = DateUtil.hoursInBetween(date1, date2);
			expect(hours).toBe(6);
		});
	});

	describe("secondsInBetween()", () => {
		it("should return correct number of seconds between dates", () => {
			const date1 = new Date("2023-10-01T00:00:00Z");
			const date2 = new Date("2023-10-01T00:01:30Z");
			const seconds = DateUtil.secondsInBetween(date1, date2);
			expect(seconds).toBe(90);
		});

		it("should return absolute value when first date is later", () => {
			const date1 = new Date("2023-10-01T00:02:00Z");
			const date2 = new Date("2023-10-01T00:00:00Z");
			const seconds = DateUtil.secondsInBetween(date1, date2);
			expect(seconds).toBe(120);
		});

		it("should return 0 for same timestamps", () => {
			const date1 = new Date("2023-10-01T12:00:00Z");
			const date2 = new Date("2023-10-01T12:00:00Z");
			const seconds = DateUtil.secondsInBetween(date1, date2);
			expect(seconds).toBe(0);
		});

		it("should work with timestamps (numbers)", () => {
			const date1 = new Date("2023-10-01T00:00:00Z").getTime();
			const date2 = new Date("2023-10-01T00:00:45Z").getTime();
			const seconds = DateUtil.secondsInBetween(date1, date2);
			expect(seconds).toBe(45);
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
			const newDate = DateUtil.addDuration(date, duration, TIMEZONE_UTC);
			expect(newDate.getTime()).toBe(new Date("2023-11-10T00:00:00.000Z").getTime());
		});

		it("should default to UTC calendar arithmetic when timezone is omitted", () => {
			const date = new Date("2026-01-30T00:00:00.000Z"); // 30 Jan 2026 00:00:00 UTC
			const newDate = DateUtil.addDuration(date, { months: 1 });
			expect(DateUtil.printDate(newDate, TIMEZONE_UTC, "yyyy-MM-dd HH:mm:ss.SSS")).toBe("2026-02-28 00:00:00.000");
		});

		it("should clamp a 29th anchor to Feb 28 in a non-leap year when using IST calendar arithmetic", () => {
			const date = new Date("2026-01-28T18:30:00.000Z"); // 29 Jan 2026 00:00:00 IST
			const newDate = DateUtil.addDuration(date, { months: 1 }, TIMEZONE_IST);

			expect(DateUtil.printDate(newDate, TIMEZONE_IST, "yyyy-MM-dd HH:mm:ss.SSS")).toBe("2026-02-28 00:00:00.000");
			expect(DateUtil.getStartOfDay(newDate, TIMEZONE_IST).getTime()).toBe(newDate.getTime());
		});

		it("should preserve a 29th anchor in leap-year February when using IST calendar arithmetic", () => {
			const date = new Date("2024-01-28T18:30:00.000Z"); // 29 Jan 2024 00:00:00 IST
			const newDate = DateUtil.addDuration(date, { months: 1 }, TIMEZONE_IST);

			expect(DateUtil.printDate(newDate, TIMEZONE_IST, "yyyy-MM-dd HH:mm:ss.SSS")).toBe("2024-02-29 00:00:00.000");
			expect(DateUtil.getStartOfDay(newDate, TIMEZONE_IST).getTime()).toBe(newDate.getTime());
		});

		it("should add month duration in IST without spilling into the next day at month end", () => {
			const date = new Date("2026-01-29T18:30:00.000Z"); // 30 Jan 2026 00:00:00 IST
			const newDate = DateUtil.addDuration(date, { months: 1 }, TIMEZONE_IST);

			expect(DateUtil.printDate(newDate, TIMEZONE_IST, "yyyy-MM-dd HH:mm:ss.SSS")).toBe("2026-02-28 00:00:00.000");
			expect(DateUtil.getStartOfDay(newDate, TIMEZONE_IST).getTime()).toBe(newDate.getTime());
		});

		it("should clamp a 30th anchor to Feb 29 in a leap year when using IST calendar arithmetic", () => {
			const date = new Date("2024-01-29T18:30:00.000Z"); // 30 Jan 2024 00:00:00 IST
			const newDate = DateUtil.addDuration(date, { months: 1 }, TIMEZONE_IST);

			expect(DateUtil.printDate(newDate, TIMEZONE_IST, "yyyy-MM-dd HH:mm:ss.SSS")).toBe("2024-02-29 00:00:00.000");
			expect(DateUtil.getStartOfDay(newDate, TIMEZONE_IST).getTime()).toBe(newDate.getTime());
		});

		it("should keep 31st-anchored month arithmetic aligned to IST calendar boundaries", () => {
			const date = new Date("2025-10-30T18:30:00.000Z"); // 31 Oct 2025 00:00:00 IST
			const newDate = DateUtil.addDuration(date, { months: 1 }, TIMEZONE_IST);

			expect(DateUtil.printDate(newDate, TIMEZONE_IST, "yyyy-MM-dd HH:mm:ss.SSS")).toBe("2025-11-30 00:00:00.000");
			expect(DateUtil.getStartOfDay(newDate, TIMEZONE_IST).getTime()).toBe(newDate.getTime());
		});

		it("should clamp a 31st anchor to Feb 28 in a non-leap year when using IST calendar arithmetic", () => {
			const date = new Date("2026-01-30T18:30:00.000Z"); // 31 Jan 2026 00:00:00 IST
			const newDate = DateUtil.addDuration(date, { months: 1 }, TIMEZONE_IST);

			expect(DateUtil.printDate(newDate, TIMEZONE_IST, "yyyy-MM-dd HH:mm:ss.SSS")).toBe("2026-02-28 00:00:00.000");
			expect(DateUtil.getStartOfDay(newDate, TIMEZONE_IST).getTime()).toBe(newDate.getTime());
		});

		it("should clamp a 31st anchor to Feb 29 in a leap year when using IST calendar arithmetic", () => {
			const date = new Date("2024-01-30T18:30:00.000Z"); // 31 Jan 2024 00:00:00 IST
			const newDate = DateUtil.addDuration(date, { months: 1 }, TIMEZONE_IST);

			expect(DateUtil.printDate(newDate, TIMEZONE_IST, "yyyy-MM-dd HH:mm:ss.SSS")).toBe("2024-02-29 00:00:00.000");
			expect(DateUtil.getStartOfDay(newDate, TIMEZONE_IST).getTime()).toBe(newDate.getTime());
		});

		it("should preserve a Feb 28 anchor when moving into March in a non-leap year", () => {
			const date = new Date("2025-02-27T18:30:00.000Z"); // 28 Feb 2025 00:00:00 IST
			const newDate = DateUtil.addDuration(date, { months: 1 }, TIMEZONE_IST);

			expect(DateUtil.printDate(newDate, TIMEZONE_IST, "yyyy-MM-dd HH:mm:ss.SSS")).toBe("2025-03-28 00:00:00.000");
			expect(DateUtil.getStartOfDay(newDate, TIMEZONE_IST).getTime()).toBe(newDate.getTime());
		});

		it("should preserve a Feb 29 anchor when moving into March in a leap year", () => {
			const date = new Date("2024-02-28T18:30:00.000Z"); // 29 Feb 2024 00:00:00 IST
			const newDate = DateUtil.addDuration(date, { months: 1 }, TIMEZONE_IST);

			expect(DateUtil.printDate(newDate, TIMEZONE_IST, "yyyy-MM-dd HH:mm:ss.SSS")).toBe("2024-03-29 00:00:00.000");
			expect(DateUtil.getStartOfDay(newDate, TIMEZONE_IST).getTime()).toBe(newDate.getTime());
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
