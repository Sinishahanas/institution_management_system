import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import './services/invoicing';

const app = express();

/**
 * Middleware: Parse incoming JSON requests
 * 
 * @purpose Parses JSON request bodies
 * @param none
 * @returns none
 * @throws none
 * @sideEffects Modifies req.body with parsed JSON
 * @example app.use(express.json());
 */
app.use(express.json());

/**
 * Middleware: Parse URL-encoded form data
 * @purpose Parses URL-encoded request bodies
 * @param none
 * @returns none
 * @throws none
 * @sideEffects Modifies req.body with parsed form data
 * @example app.use(express.urlencoded({ extended: false }));
 */
app.use(express.urlencoded({ extended: false }));


/**
 * Middleware: API request logging
 * @purpose Logs API request method, path, status, duration, and JSON response
 * @param req Express Request object
 * @param res Express Response object
 * @param next Next middleware function
 * @returns none
 * @throws none
 * @sideEffects Logs request info to console
 * @example GET /api/students 200 in 15ms :: {"id":1,"name":"John"}
 */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  /**
   * Registers all routes and returns HTTP server
   * @purpose Dynamically register all app routes
   * @param app Express application instance
   * @returns Promise<import('http').Server>
   * @throws Any error during route registration
   * @sideEffects None
   * @example const server = await registerRoutes(app);
   */
  const server = await registerRoutes(app);

  /**
   * Global error handler
   * @purpose Sends JSON response for errors
   * @param err Error object
   * @param _req Express request object (unused)
   * @param res Express response object
   * @param _next Next function (unused)
   * @returns none
   * @throws Re-throws the error
   * @sideEffects Sends JSON { message } to client
   * @example // Returns { message: "Internal Server Error" } for unhandled errors
   */
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  /**
   * Vite setup or serve static files depending on environment
   * @purpose Integrates Vite in development or serves static build in production
   * @param none
   * @returns none
   * @throws Any error thrown by setupVite or serveStatic
   * @sideEffects Hooks frontend into Express backend
   * @example // Development: HMR via Vite, Production: serves /dist
   */
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  
  /**
   * Starts the HTTP server
   * @purpose Binds server to host and port
   * @param none
   * @returns none
   * @throws Any error if port binding fails
   * @sideEffects Logs startup message
   * @example // Logs: serving on port 5000
   */
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    // reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();