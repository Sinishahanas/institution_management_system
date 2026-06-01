import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

/**
 * changePasswordSchema
 *
 * @purpose Defines validation rules for changing a user's password.
 * 
 * @param {Object} data - The data to validate
 * @param {string} data.currentPassword - The user's current password
 * @param {string} data.newPassword - The new password
 * @param {string} data.confirmPassword - The confirmation password
 * @returns {ZodSchema} A Zod schema for validating change password form values.
 * @throws {ZodError} If validation fails (e.g., password too short or mismatch).
 * @sideEffects None
 *
 * @example
 * ```ts
 * const result = changePasswordSchema.safeParse({
 *   currentPassword: "oldPass123",
 *   newPassword: "newPass123",
 *   confirmPassword: "newPass123",
 * });
 * if (!result.success) console.log(result.error);
 * ```
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


/**
 * @typedef {z.infer<typeof changePasswordSchema>} ChangePasswordFormValues
 * @description Type representing the validated form values for changing password.
 */
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;


/**
 * useChangePassword
 *
 * @purpose
 * A custom React hook that provides a mutation to change the current user's password.
 * Validates input using Zod schema and handles success/error notifications via `useToast`.
 *
 * @param {Object} data - The data to validate
 * @param {string} data.currentPassword - The user's current password
 * @param {string} data.newPassword - The new password
 * @returns {object} An object containing the mutation object:
 *   - `changePasswordMutation` ({@link UseMutationResult}) - Mutation object to trigger password change.
 * @throws {Error} Thrown when the API call fails or returns an error message.
 * @sideEffects
 *   - Calls `/api/change-password` endpoint with the provided current and new passwords.
 *   - Displays toast notifications on success or failure.
 *   - Updates any cached authentication/user state if required externally.
 *
 * @example
 * ```ts
 * const { changePasswordMutation } = useChangePassword();
 * 
 * const onSubmit = (values: ChangePasswordFormValues) => {
 *   changePasswordMutation.mutate({
 *     currentPassword: values.currentPassword,
 *     newPassword: values.newPassword,
 *   });
 * };
 * ```
 */
export function useChangePassword() {
  const { toast } = useToast();
  const { user } = useAuth();

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/change-password", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to change password");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your password has been changed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  return { changePasswordMutation };
}