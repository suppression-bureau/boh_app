import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
    // override defaults so index.html can be in src/front
    root: "src/front",
    cacheDir: "../../.vite_cache",
    build: {
        outDir: "../../dist",
    },
    // app specific settings
    plugins: [react()],
})
