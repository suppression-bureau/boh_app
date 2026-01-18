import { includeIgnoreFile } from "@eslint/compat"
import js from "@eslint/js"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import unicorn from "eslint-plugin-unicorn"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import { fileURLToPath } from "node:url"
import tseslint from "typescript-eslint"

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url))

export default defineConfig([
    includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
    globalIgnores([".yarn/*", "dist/*", "src/front/gql/*", "!**/.*.ts"]),
    {
        extends: [
            js.configs.recommended,
            tseslint.configs.recommendedTypeChecked,
            tseslint.configs.stylisticTypeChecked,
            react.configs.flat.recommended,
            react.configs.flat["jsx-runtime"],
            reactHooks.configs.flat.recommended,
            unicorn.configs.recommended,
        ],

        /*
        plugins: {
            "typescript-eslint": tseslint,
            react,
            "react-hooks": reactHooks,
            unicorn,
        },*/

        languageOptions: {
            globals: {
                ...globals.browser,
            },

            parser: tseslint.parser,
            ecmaVersion: "latest",
            sourceType: "module",

            /** @satisfies {import("@typescript-eslint/types").ParserOptions} */
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        rules: {
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        {
                            name: "@mui/material",
                            message:
                                "For small bundle size, import from @mui/material/* instead",
                        },
                    ],

                    patterns: ["!@mui/material/*"],
                },
            ],

            "react-hooks/exhaustive-deps": "error",
            "unicorn/prevent-abbreviations": "off",
            "unicorn/filename-case": "off",
        },
    },
    {
        files: ["*.cjs"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
])
