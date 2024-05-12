import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fromEnv } from "../index";

describe("fromEnv", function () {
	const baseUrl = prepareEnvVarTest("BASE_URL", undefined);

	beforeEach(function () {
		baseUrl.mock(undefined);
	});
	afterEach(function () {
		baseUrl.unmock();
	});

	describe("required()", function () {
		it("errors if required() BASE_URL is missing and no fallback is provided", function () {
			baseUrl.mock(undefined);
			expect(() => fromEnv("BASE_URL").required()).toThrow();
		});

		it("returns fallback url if required() BASE_URL is missing and a fallback is provided", function () {
			baseUrl.mock(undefined);
			expect(fromEnv("BASE_URL").fallback("https://google.com").required().string()).toEqual(
				"https://google.com"
			);
		});

		it("returns url if required() BASE_URL is NOT missing", function () {
			baseUrl.mock("https://duckduckgo.com/");
			expect(fromEnv("BASE_URL").required().string()).toEqual("https://duckduckgo.com/");
		});
	});

	describe("integer()", function () {
		const port = prepareEnvVarTest("PORT", undefined);

		beforeEach(function () {
			port.mock(undefined);
		});
		afterEach(function () {
			port.unmock();
		});

		it('returns 3000 for "PORT=3000"', function () {
			port.mock(3000);
			const value = fromEnv("PORT").required().integer();

			expect(value).toBe(3000);
		});

		it("errors if integer() is called with default behavior and PORT is not an integer", function () {
			port.mock("abc");
			expect(() => fromEnv("PORT").integer()).toThrow();
		});

		it("errors for fallback=3001 with default behavior and PORT is missing", function () {
			port.mock(undefined);
			expect(() => fromEnv("PORT").fallback(3001).integer()).toThrow();
		});

		it("errors for fallback=3001, parseBehavior='error' with default behavior and PORT is missing", function () {
			port.mock(undefined);
			expect(() => fromEnv("PORT").fallback(3001).integer({ parseBehavior: "error" })).toThrow();
		});

		it("returns fallback for fallback=3001, parseBehavior='fallback' with default behavior and PORT is missing", function () {
			port.mock(undefined);
			expect(fromEnv("PORT").fallback(3001).integer({ parseBehavior: "fallback" })).toBe(3001);
		});
	});
});

function prepareEnvVarTest<Value>(envVar: keyof typeof process.env, value: Value) {
	const originalValue = process.env[envVar];

	function mock(newValue?: string | number) {
		if (newValue == null) {
			return (process.env[envVar] = String(newValue));
		}

		return (process.env[envVar] = String(value));
	}

	function unmock() {
		process.env[envVar] = originalValue;
	}

	return {
		mock,
		unmock,
	};
}
