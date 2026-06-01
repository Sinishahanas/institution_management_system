import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

/**
 * @purpose
 *   Extends the Express `Request` interface's `user` property to include the full `SelectUser` type from your schema. This allows TypeScript to know the structure of `req.user` when using Passport.
 *
 * @param None
 * @returns None
 * @throws None
 * @sideEffects
 *   - Modifies the global Express namespace for TypeScript type checking
 *
 * @example
 *   // After this declaration, you can safely access properties of SelectUser:
 *   app.get('/profile', (req, res) => {
 *     const userId = req.user.id; // TypeScript knows `id` exists
 *     res.send(`Hello user ${userId}`);
 *   });
 */
declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

/**
 * @purpose
 *   Converts Node.js callback-based `crypto.scrypt` function into a Promise-based version.
 *   This allows using `await` when hashing passwords.
 *
 * @param None
 * @returns {Function} A promisified version of `scrypt` that returns a Buffer
 * @throws None directly, but the returned function can reject if scrypt fails
 * @sideEffects None
 *
 * @example
 *   const derivedKey = await scryptAsync('myPassword', 'randomSalt', 64);
 *   console.log(derivedKey.toString('hex'));
 */
const scryptAsync = promisify(scrypt);

/**
 * hashPassword
 *
 * @purpose
 *   Hashes a plain-text password using scrypt with a random salt.
 *
 * @param {string} password - The plain-text password to hash
 * @returns {Promise<string>} - Resolves to a string in the format `salt:hashedPassword`
 * @throws {Error} - Throws if scrypt hashing fails
 * @sideEffects - None
 *
 * @example
 *   const hashed = await hashPassword("mySecret123");
 */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return salt + ":" + derivedKey.toString("hex");
}

/**
 * comparePasswords
 *
 * @purpose
 *   Compares a supplied password with a stored hashed password.
 *
 * @param {string} supplied - The plain-text password provided by the user
 * @param {string} stored - The stored hashed password in the format `salt:hashedPassword`
 * @returns {Promise<boolean>} - Resolves to true if passwords match, false otherwise
 * @throws {Error} - Throws if scrypt hashing fails
 * @sideEffects - None
 *
 * @example
 *   const isMatch = await comparePasswords("mySecret123", storedHash);
 */
export async function comparePasswords(supplied: string, stored: string) {
  const [salt, hashedPassword] = stored.split(":");
  const derivedKey = (await scryptAsync(supplied, salt, 64)) as Buffer;
  const storedKey = Buffer.from(hashedPassword, "hex");
  return timingSafeEqual(derivedKey, storedKey);
}

/**
 * setupAuth
 *
 * @purpose
 *   Sets up authentication middleware for an Express app using Passport.js
 *   LocalStrategy with username/password and session management.
 *   Also sets up routes for registration, login, logout, and retrieving the authenticated user.
 *
 * @param {Express} app - The Express application instance
 * @returns {void}
 * @throws {Error} - Throws if session setup or route handling encounters an error
 * @sideEffects
 *   - Configures session middleware on the Express app
 *   - Registers Passport.js strategies
 *   - Adds authentication routes (`/api/register`, `/api/login`, `/api/logout`, `/api/user`)
 *
 * @example
 *   import express from "express";
 *   import { setupAuth } from "./auth";
 *
 *   const app = express();
 *   app.use(express.json());
 *   setupAuth(app);
 */
export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "jazz-rockers-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        if (await comparePasswords(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password." });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  // passport.deserializeUser(async (id: number, done) => {
  //   try {
  //     const user = await storage.getUser(id);
  //     done(null, user);
  //   } catch (err) {
  //     done(err);
  //   }
  // });
  passport.deserializeUser(async (id: number, done) => {
    try {
      // console.log("Deserializing user with ID:", id);
      const user = await storage.getUser(id);
      if (!user) {
        console.error("No user found for ID:", id);
        return done(new Error("User not found"));
      }
      done(null, user);
    } catch (err) {
      console.error("Deserialization error:", err);
      done(err);
    }
  });

  /**
   * @purpose
   *   Registers a new user in the system. Hashes the password securely before storing.
   *   Automatically logs in the user after successful registration.
   *
   * @param {object} req.body
   * @param {string} req.body.username - Desired username for the account
   * @param {string} req.body.password - Plain-text password for the account
   * @param {string} [otherFields] - Any additional user fields (e.g., email, name)
   * @returns {object} JSON response with the newly created user object, excluding the password
   * @throws
   *   - 400: Username already exists
   *   - 500: Server error if hashing or database insertion fails
   * @sideEffects
   *   - Inserts a new user into the database
   *   - Hashes the user's password with scrypt
   *   - Starts a session and logs in the new user
   *
   * @example
   *   POST /api/register
   *   {
   *     "username": "john_doe",
   *     "password": "MySecret123",
   *     "email": "john@example.com",
   *     "role": "student"
   *   }
   *
   *   Response:
   *   {
   *     "id": 123,
   *     "username": "john_doe",
   *     "email": "john@example.com",
   *     "role": "student"
   *   }
   */
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });

  /**
 * @purpose
 *   Authenticates a user using Passport's local strategy.
 *   Verifies username and password, and starts a session on success.
 *
 * @param {object} req.body
 * @param {string} req.body.username - Username of the user
 * @param {string} req.body.password - Plain-text password
 * @returns {object} JSON response containing authenticated user info (excluding password)
 * @throws
 *   - 401: Authentication failed (incorrect username or password)
 *   - 500: Server error if authentication or session fails
 * @sideEffects
 *   - Initiates a session and logs in the user
 *
 * @example
 *   POST /api/login
 *   {
 *     "username": "john_doe",
 *     "password": "MySecret123"
 *   }
 */
  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (err: Error, user: SelectUser, info: any) => {
        if (err) return next(err);
        if (!user)
          return res
            .status(401)
            .json({ message: info?.message || "Authentication failed" });

        req.login(user, (err) => {
          if (err) return next(err);
          const { password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      }
    )(req, res, next);
  });

  /**
 * @purpose
 *   Logs out the currently authenticated user and destroys the session.
 *
 * @param None
 * @returns {number} HTTP status code 200 on successful logout
 * @throws - 500: Server error if logout fails
 * @sideEffects - Terminates the user's session
 * @example
 *   POST /api/logout
 *   Response: 200 OK
 */
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  /**
 * @purpose
 *   Returns information about the currently authenticated user.
 * @param None
 * @returns {object} JSON response containing user information (excluding password)
 * @returnsExample
 *   HTTP 200
 *   {
 *     "id": 123,
 *     "username": "john_doe",
 *     "email": "john@example.com",
 *     "role": "student"
 *   }
 *
 * @throws
 *   - 401: Unauthorized if user is not authenticated
 *
 * @sideEffects None
 *
 * @example
 *   GET /api/user
 *   Response:
 *   {
 *     "id": 123,
 *     "username": "john_doe",
 *     "email": "john@example.com",
 *     "role": "student"
 *   }
 */
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
