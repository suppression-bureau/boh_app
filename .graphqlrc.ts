/** Use CodegenConfig instead of IGraphQLConfig to share config file */
import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
    schema: "src/front/gql/schema.graphql",
    documents: ["src/**/*.{graphql,ts,tsx}"],
    generates: {
        "./src/front/gql/": {
            preset: "client",
        },
    },
}

export default config
