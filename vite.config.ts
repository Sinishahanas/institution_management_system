import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Vite configuration object.
 * 
 * This configuration sets up a Vite project for a React application including plugins for React support, theme management, error overlays,
 * It also configures the project root and build output.
 *
 * @constant
 * @type {import('vite').UserConfig}
 * @property {Array<import('vite').PluginOption>} plugins - An array of Vite plugins to extend functionality.
 *   - `react()`: Provides React support, including Fast Refresh.
 *   - `runtimeErrorOverlay()`: Displays a modal for runtime errors during development.
 *   - `themePlugin()`: Integrates with `@replit/vite-plugin-shadcn-theme-json` for theme management.
 *   - Optional `@replit/vite-plugin-cartographer` for development on Replit.
 * @property {object} resolve - Configuration for module resolution.
 *   - `@`: Points to the client-side source directory.
 *   - `@shared`: Points to the shared code directory.
 *   - `@assets`: Points to the attached assets directory.
 * @property {string} root - The base directory from which Vite will serve files.
 * @property {object} build - Build-specific configuration.
 * @property {string} build.outDir - The output directory for the build files.
 * @property {boolean} build.emptyOutDir - Clears the output directory before building.
 *
 * @example
 * // To run the development server:
 * // `vite`
 *
 * @example
 * // To build the application for production:
 * // `vite build`
 */
export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
