import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import tsconfigPaths from "vite-tsconfig-paths";
import permissions from "./permissions.json";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
	const chromeManifest = {
		...manifest,
		host_permissions: permissions.CHROME_MANIFEST.HOST_PERMISSIONS,
		permissions: permissions.CHROME_MANIFEST.PERMISSIONS,
	};

	return {
		plugins: [react(), crx({ manifest: chromeManifest }), tsconfigPaths()],
		server: {
			port: 3000,
		},
		build: {
			rollupOptions: {
				input: {
					main: path.resolve(__dirname, "index.html"),
					nested: path.resolve(__dirname, "nested/index.html"),
				},
			},
		},
	};
});
