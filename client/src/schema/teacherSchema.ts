import * as z from "zod";

/**
 * TeacherSchema
 *
 * @purpose
 * - Validates the data for creating or updating a teacher record in the system.
 * - Ensures required fields are present, optional fields are handled correctly, email format is valid, at least one branch is selected, and status is either "active" or "inactive".
 *
 * @param none
 * @returns {ZodSchema<TeacherFormValues>} A Zod schema object used for validation of teacher form data.
 * @throws {ZodError} Throws a validation error if any required field is missing or invalid.
 * @sideEffects none
 * 
 * @example
 * ```ts
 * const newTeacher = {
 *   employeeId: "T123",
 *   firstName: "Alice",
 *   lastName: "Johnson",
 *   email: "alice@example.com",
 *   username: "alicej",
 *   password: "securePass123",
 *   joiningDate: "2025-01-15",
 *   salary: "50000",
 *   branch: ["Main Branch"],
 *   status: "active"
 * };
 * 
 * const parsedTeacher = TeacherSchema.parse(newTeacher); // Validates data, throws if invalid
 * ```
 */
export const TeacherSchema = z.object({
  employeeId: z.string(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string(),
  password: z.string(),
  phoneNumber: z.number().optional(),
  whatsappNumber: z.number().optional(),
  joiningDate: z.string(),
  salary: z.string().min(1, "Salary is required"),
  bankAccount: z.string().optional(),
  ifscIbanBsb: z.string().optional(),
  branch: z.array(z.string()).min(1, "At least one branch is required"),
  specialization: z.string().optional(),
  residenceAddress: z.string().optional(),
  street: z.string().optional(),
  community: z.string().optional(),
  flatNumber: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

/**
 * TeacherFormValues
 *
 * @purpose TypeScript type inferred from `TeacherSchema` representing the shape of validated teacher form data.
 * 
 * @param none
 * @returns {TeacherFormValues} A TypeScript type object representing the shape of validated teacher form data.
 * @throws {Error} Throws an error if the data does not meet the specified requirements when parsing or validating data.
 * @sideEffects none
 *
 * @example
 * ```ts
 * const teacher: TeacherFormValues = {
 *   employeeId: "T124",
 *   firstName: "Bob",
 *   lastName: "Smith",
 *   email: "bob@example.com",
 *   username: "bobsmith",
 *   password: "password123",
 *   joiningDate: "2025-02-01",
 *   salary: "55000",
 *   branch: ["North Campus"],
 *   status: "active"
 * };
 * ```
 */
export type TeacherFormValues = z.infer<typeof TeacherSchema>;
