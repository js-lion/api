import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    target: "modules",
    lib: {
      entry: "src/index",
      name: "api",
      formats: ["es"],
      fileName: "api"
    },
    sourcemap: true,
    manifest: false,
    rollupOptions: {
      external: [
        "axios", 
        "lodash-es",
        "reflect-metadata"
      ],
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
