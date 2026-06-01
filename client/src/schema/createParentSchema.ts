import { z } from "zod";

/**
 * CreateParentSchema
 *
 * @purpose
 * - Validates the data for creating a new parent user in the system.
 * - Ensures required fields are present, strings have minimum lengths, email is valid, password meets minimum requirements, and status is either "active" or "inactive".
 *
 * @param none
 * @returns {ZodSchema<CreateParentType>} A Zod schema object used for validation of parent creation data.
 * @throws {ZodError} Throws a validation error if any field does not meet the specified requirements when parsing or validating data.
 * @sideEffects none
 * 
 * @example
 * ```ts
 * const parentData = {
 *   first_name: "John",
 *   middle_name: "A.",
 *   last_name: "Doe",
 *   username: "johndoe",
 *   password: "secret123",
 *   phone: "1234567890",
 *   whatsapp_no: "1234567890",
 *   email: "john@example.com",
 *   street: "Main St",
 *   community: "Central",
 *   residence_address: "123 Main St, Apt 4",
 *   flat_no: "4B",
 *   status: "active"
 * };
 * 
 * const parsedData = CreateParentSchema.parse(parentData); // Validates data, throws if invalid
 * ```
 */
export const CreateParentSchema = z.object({
  first_name: z.string().min(1, { message: "Field is required!" }),
  middle_name: z.string(),
  last_name: z.string().min(1, { message: "Field is required!" }),
  username: z.string().min(1, { message: "Field is required!" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  phone: z.string().min(1, { message: "Field is required!" }),
  whatsapp_no: z.string(),
  email: z
    .string()
    .min(1, { message: "Field is required!" })
    .email({ message: "Invalid email address!" }),
  street: z.string(),
  community: z.string(),
  residence_address: z.string(),
  flat_no: z.string(),
  status: z
    .enum(["active", "inactive"])
    .refine((val) => val === "active" || val === "inactive", {
      message: "Status is required",
    }),
});


/**
 * CreateParentType
 *
 * @purpose TypeScript type inferred from `CreateParentSchema` representing the shape of validated parent creation data.
 * 
 * @param none
 * @returns {CreateParentType} A TypeScript type object representing the shape of validated parent creation data.
 * @throws {Error} Throws an error if the data does not meet the specified requirements when parsing or validating data.
 * @sideEffects none
 *
 * @example
 * ```ts
 * const parent: CreateParentType = {
 *   first_name: "Jane",
 *   middle_name: "B.",
 *   last_name: "Smith",
 *   username: "janesmith",
 *   password: "password123",
 *   phone: "9876543210",
 *   whatsapp_no: "9876543210",
 *   email: "jane@example.com",
 *   street: "Second St",
 *   community: "West",
 *   residence_address: "456 Second St, Apt 12",
 *   flat_no: "12C",
 *   status: "active"
 * };
 * ```
 */
export type CreateParentType = z.infer<typeof CreateParentSchema>;
