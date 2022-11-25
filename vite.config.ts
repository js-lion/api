import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: "modules",
    lib: {
      entry: "src/libs/index",
      name: "api",
      formats: ["es"],
      fileName: "api"
    },
    sourcemap: true,
    manifest: false,
    rollupOptions: {
      external: [
        "vue", 
        "axios", 
        "lodash-es",
        "@vueuse/core",
        "reflect-metadata"
      ],
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
