class MissingEnvironmentVaribleError extends Error {
	constructor(envVar: keyof typeof process.env) {
		super(`Missing environment variable ${envVar}`);
		this.name = this.constructor.name;
	}
}

class NotAnIntegerError extends Error {
	constructor(identifier: string | string[] | number, number: unknown) {
		super(`${identifier}=${number} is not an integer`);
		this.name = this.constructor.name;
	}
}

interface FromEnvContext {
	fallback: <Fallback extends any>(fallback?: Fallback) => FromEnvContext;
	required: (fallback?: unknown) => FromEnvContext;
	integer: (params?: { parseBehavior?: "fallback" | "error" }) => number;
	string: any;
	number: any;
	array: any;
}

export function fromEnv(envVar: keyof typeof process.env) {
	const value = process.env[envVar];
	let fallback: unknown = undefined;
	const ctx: FromEnvContext = {
		fallback<Type extends any>(fallbackValue: Type) {
			fallback = fallbackValue;
			return ctx;
		},
		required() {
			if (fallback === undefined && (value === null || value === undefined || value === "undefined")) {
				throw new MissingEnvironmentVaribleError(envVar);
			}

			return ctx;
		},
		integer(params = { parseBehavior: "error" }) {
			if (fallback !== undefined && !Number.isInteger(fallback)) {
				throw new NotAnIntegerError("fallback", fallback);
			}

			const int = parseInt(value || "");

			if (Number.isNaN(int) && fallback && params.parseBehavior === "fallback") {
				return fallback as number;
			}

			if (Number.isNaN(int)) {
				throw new NotAnIntegerError(`process.env['${envVar}']`, fallback);
			}

			return int;
		},
		string() {},
		number() {},
		array(separator: string) {},
	};

	return ctx;
}
