import { z } from "zod";

/**
 * resetPasswordSchema
 *
 * @purpose Validates the data for resetting a user's password. Ensures that the `password` meets minimum length requirements and that `confirmPassword` matches `password`.
 *
 * @param none
 * @returns {ZodSchema<ResetPasswordSchemaType>} A Zod schema object used for validation of reset password data.
 * @throws {ZodError} Throws a validation error if `password` is too short or if the passwords do not match.
 * @sideEffects none
 * 
 * @example
 * ```ts
 * const resetData = {
 *   password: "newpassword123",
 *   confirmPassword: "newpassword123"
 * };
 * const parsedData = resetPasswordSchema.parse(resetData); // Validates data, throws if invalid
 * ```
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * ResetPasswordSchemaType
 *
 * @purpose TypeScript type inferred from `resetPasswordSchema` representing the shape of validated reset password data.
 * 
 * @param none
 * @returns {ResetPasswordSchemaType} A TypeScript type object representing the shape of validated reset password data.
 * @throws {Error} Throws an error if the data does not meet the specified requirements when parsing or validating data.
 * @sideEffects none
 *
 * @example
 * ```ts
 * const resetPasswordData: ResetPasswordSchemaType = {
 *   password: "securepassword",
 *   confirmPassword: "securepassword"
 * };
 * ```
 */
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
