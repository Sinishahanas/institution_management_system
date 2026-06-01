import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

/**
 * Converts a file URL to a file system path.
 *
 * @function
 * @purpose Converts a file URL to a file system path.
 * @param {string} url - The file URL to convert (e.g., import.meta.url)
 * @returns {string} The absolute file system path
 * @throws {TypeError} If the argument is not a valid file URL
 * @sideEffects None
 * @example
 * const __filename = fileURLToPath(import.meta.url);
 * // -> "/Users/you/project/src/index.js"
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Returns the directory name of a file path.
 *
 * @method
 * @purpose Returns the directory name of a file path.
 * @param {string} filePath - Absolute or relative path to a file
 * @returns {string} The directory path containing the file
 * @throws {TypeError} If filePath is not a string
 * @sideEffects None
 * @example
 * const __dirname = path.dirname(__filename);
 * // -> "/Users/you/project/src"
 */
const __dirname = dirname(__filename);

/**
 * Vite logger instance
 * @purpose Provides logging utilities for Vite processes
 * @type import('vite').Logger
 * @returns Vite logger object
 * @throws none
 * @sideEffects none
 * @example viteLogger.info("Vite server started");
 */
const viteLogger = createLogger();

/**
 * Logs messages with timestamp and source
 * 
 * @purpose Standardize logging for Express and Vite
 * 
 * @param message Message to log
 * @param source Source of the log (default: "express")
 * @returns none
 * @throws none
 * @sideEffects Prints message to console
 * 
 * @example log("Server started", "express");
 */
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Sets up Vite middleware for development
 * 
 * @purpose Integrates Vite in middleware mode with HMR for dev
 * 
 * @param app Express application instance
 * @param server HTTP server instance for HMR
 * @returns Promise<void>
 * @throws Throws error if Vite cannot transform or read files
 * @sideEffects Mounts Vite middleware on Express app
 * 
 * @example await setupVite(app, server);
 */
export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

/**
 * Serves static files from production build
 * 
 * @purpose Serves pre-built client files in production
 * 
 * @param app Express application instance
 * @returns none
 * @throws Throws error if build directory is missing
 * @sideEffects Mounts static file middleware on Express app
 * 
 * @example serveStatic(app);
 */
export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}