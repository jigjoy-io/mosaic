import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/consistent-type-imports": "error",
		},
	},
	{
		ignores: [
			"dist/**",
			"build/**",
			"node_modules/**",
			"*.config.js",
			"*.config.ts",
			"coverage/**",
			"tests/**", // Ignoring tests for now. Need to write new tests
		],
	},
)
