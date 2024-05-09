import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest }), tsconfigPaths()],
  server: {
    port: 3000,
  },
})
