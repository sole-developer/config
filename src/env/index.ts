class MissingEnvironmentVaribleError extends Error {
	constructor(envVar: keyof typeof process.env) {
		super(`Missing environment variable ${envVar}`);
		this.name = this.constructor.name;
	}
}

class NotTypeError extends Error {
	constructor(type: "string" | "number" | "integer", identifier: string | string[] | number, value: unknown) {
		super(`${identifier}=${value} is not of type ${type}`);
	}
}

class NotStringError extends NotTypeError {
	constructor(identifier: string | string[] | number, str: unknown) {
		super("string", identifier, str);
		this.name = this.constructor.name;
	}
}

class NotIntegerError extends NotTypeError {
	constructor(identifier: string | string[] | number, str: unknown) {
		super("integer", identifier, str);
		this.name = this.constructor.name;
	}
}

class NotNumberError extends NotTypeError {
	constructor(identifier: string | string[] | number, str: unknown) {
		super("number", identifier, str);
		this.name = this.constructor.name;
	}
}

interface FromEnvContext {
	fallback: <Fallback extends string | number>(fallback?: Fallback) => FromEnvContext;
	required: (fallback?: unknown) => FromEnvContext;
	integer: (params?: { parseBehavior?: "fallback" | "error" }) => number;
	string: () => string;
	number: () => number;
	array: <Type extends string | number>(separator: string) => Array<Type>;
}

export function fromEnv(envVar: keyof typeof process.env) {
	const value = process.env[envVar];
	let fallback: unknown = undefined;
	const ctx: FromEnvContext = {
		fallback<Type>(fallbackValue: Type) {
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
				throw new NotIntegerError("fallback", fallback);
			}

			const int = parseInt(value || "");

			if (Number.isNaN(int) && fallback && params.parseBehavior === "fallback") {
				return fallback as number;
			}

			if (Number.isNaN(int)) {
				throw new NotIntegerError(`process.env['${envVar}']`, fallback);
			}

			return int;
		},
		string() {
			const isUndefined = !value?.length || value === "undefined";
			if (isUndefined && fallback !== undefined) {
				return String(fallback);
			}

			if (isUndefined) {
				throw new NotStringError(`process.env['${envVar}']`, value);
			}

			return String(value);
		},
		number() {
			if (Number.isNaN(value) && !Number.isNaN(fallback)) {
				return Number(fallback);
			}

			if (Number.isNaN(value)) {
				throw new NotNumberError(`process.env['${envVar}']`, value);
			}

			return Number(value);
		},
		array<Type>(_separator: string) {
			throw new Error("Not implemented");
		},
	};

	return ctx;
}
