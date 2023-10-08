import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
import process from "node:process"

// https://vitejs.dev/config/
export default defineConfig({
    // override defaults so index.html can be in src/front
    root: "src/front",
    cacheDir: "../../.vite_cache",
    build: {
        outDir: "../../dist",
    },
    resolve: {
        alias: { "/src/front": path.resolve(process.cwd(), "src/front") },
    },
    // app specific settings
    plugins: [react()],
})
