import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: "modules",
    lib: {
      entry: "src/utils/http/index.ts",
      name: "api",
      formats: ["es"],
      fileName: "api"
    },
    sourcemap: true,
    manifest: false,
    rollupOptions: {
      external: ["vue", "lodash-es", "axios", "@vueuse/core"],
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
