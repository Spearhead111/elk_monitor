import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import requireTransform from 'vite-plugin-require-transform'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // @ts-ignore
    requireTransform({
      fileRegex: /.js$|.vue$|.ts$/,
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
})
