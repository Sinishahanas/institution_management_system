import nodemailer, { Transporter } from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

/**
 * Converts a file URL to a file system path.
 *
 * @purpose Converts a file URL to a file system path.
 * 
 * @param {string} url - The file URL to convert (e.g., import.meta.url)
 * @returns {string} The absolute file system path
 * @throws {TypeError} If the argument is not a valid file URL
 * @sideEffects None
 * 
 * @example
 * const __filename = fileURLToPath(import.meta.url);
 * // -> "/Users/you/project/src/index.js"
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Returns the directory name of a file path.
 *
 * @purpose Returns the directory name of a file path.
 * 
 * @param {string} filePath - Absolute or relative path to a file
 * @returns {string} The directory path containing the file
 * @throws {TypeError} If filePath is not a string
 * @sideEffects None
 * 
 * @example
 * const __dirname = path.dirname(__filename);
 * // -> "/Users/you/project/src"
 */
const __dirname = path.dirname(__filename);

/**
 * Loads environment variables from a .env file into process.env.
 *
 * @purpose Loads environment variables from a .env file into process.env.
 * 
 * @param {Object} [options] - Configuration options
 * @param {string} [options.path] - Absolute path to the .env file. Defaults to ".env" in the current working directory
 * @returns {Object} An object containing parsed and loaded environment variables
 * @throws {Error} If the .env file cannot be read or parsed
 * @sideEffects Populates process.env with environment variables
 * 
 * @example
 * dotenv.config({
 *   path: path.resolve(process.cwd(), ".env"),
 * });
 */
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

/**
 * Creates and configures a Nodemailer transporter with Handlebars support.
 *
 * @purpose
 * - Initializes a reusable email transporter using SMTP credentials from environment variables.
 * - Configures Handlebars templates for dynamic email content rendering.
 * @param none
 * @returns {Transporter} A configured Nodemailer transporter instance.
 * @throws {Error} If transporter creation or Handlebars configuration fails.
 * @sideEffects
 * - Reads environment variables for SMTP configuration.
 * - Uses Handlebars to compile email templates from the `./templates` directory.
 *
 * @example
 * const transporter = createEmailTransporter();
 * // transporter can now be used to send emails
 */
function createEmailTransporter(): Transporter {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Only for development
      },
    });

    // Configure Handlebars for Email Templates
    transporter.use(
      "compile",
      hbs({
        viewEngine: {
          extname: ".hbs",
          defaultLayout: false,
          partialsDir: path.resolve(__dirname, "./templates"),
        },
        viewPath: path.resolve(__dirname, "./templates"),
        extName: ".hbs",
      })
    );

    return transporter;
  } catch (error) {
    throw error;
  }
}

// Initialize transporter
const transporter = createEmailTransporter();

/**
 * Sends an email using the configured Nodemailer transporter.
 *
 * @purpose Sends an email with a specific template, recipient, subject, and context for Handlebars rendering.
 *
 * @param {string} template - The name of the Handlebars template to use.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {object} context - The dynamic data to pass into the template.
 * @returns {Promise<any>} Resolves with the info object returned by Nodemailer.
 * @throws {Error} If sending the email fails.
 * @sideEffects
 * - Sends an actual email via SMTP.
 * - Logs the message ID to the console.
 *
 * @example
 * await sendEmail(
 *   "welcome",
 *   "user@example.com",
 *   "Welcome to Jazz Rockers!",
 *   { name: "John Doe" }
 * );
 */
export async function sendEmail(
  template: string,
  to: string,
  subject: string,
  context: object,
  // attachments?: { filename: string; content: Buffer }[]
) {
  try {
    const mailOptions = {
      from: `"No Reply" <${process.env.SMTP_USER}>`,
      to,
      subject,
      template,
      context,
      // attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error: any) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
}
