/* This sadly needs to be both JS and even CJS
 * @see https://github.com/prettier/prettier/issues/15085
 */
/** @type {import("prettier").Config} */
module.exports = {
    plugins: [require.resolve("@trivago/prettier-plugin-sort-imports")],
    semi: false,
    trailingComma: "all",
    importOrder: ["<THIRD_PARTY_MODULES>", "^@mui/(.*)$", "^[./]"],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
    overrides: [
        // JSON with comments and trailing commas
        {
            files: ["**.vscode/*.json", "tsconfig*.json"],
            options: {
                parser: "json5",
                quoteProps: "preserve",
                singleQuote: false,
            },
        },
    ],
}
