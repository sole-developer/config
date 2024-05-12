import { configDefaults, defineConfig } from "vitest/config";

module.exports = defineConfig({
	test: {
		exclude: [...configDefaults.exclude],
	},
});
