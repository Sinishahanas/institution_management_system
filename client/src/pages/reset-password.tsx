import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import {
  resetPasswordSchema,
  ResetPasswordSchemaType,
} from "@/schema/resetPasswordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { log } from "console";
import { Mail } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useParams } from "wouter";

/**
 * ResetPasswordPage component
 *
 * @purpose
 * Renders the page that allows a user (parent) to reset their password using a token.
 * It wires up form validation, handles submission, shows success/error toasts, and redirects the user back to the auth page on success.
 *
 * @param none
 * @returns {JSX.Element | null} Returns the reset-password form UI (JSX). If the token is missing or the page cannot be rendered for some reason, the component may return `null` (or alternative UI) — implementation detail.
 * @throws none
 * @sideEffects
 * - Reads the `token` parameter from the route via `useParams`.
 * - Uses `react-hook-form` to manage form state and validation.
 * - Performs a network request to reset the password when the form is submitted.
 * - Shows success and error toasts.
 * - Navigates the user to the auth page on successful reset.
 *
 * @example
 * ```tsx
 * // Route: /reset-password/:token
 * <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
 * ```
 */
export default function ResetPasswordPage() {
  const { token } = useParams();
  const [, navigate] = useLocation();

  /**
   * React Hook Form initialization for Reset Password.
   *
   * @purpose Initializes and configures the React Hook Form instance for the Reset Password form.
   *
   * @param none
   * @returns An object containing the following:
   * - `handleSubmit`: Function to handle form submission.
   * - `reset`: Function to reset form fields.
   * - `control`: Object passed to controlled form inputs (for use with Controller).
   * - `formState.errors`: Object containing validation errors for each field.
   * @sideEffects none
   * @throws none
   *
   * @example
   * ```ts
   * // Usage in JSX
   * <form onSubmit={handleSubmit(handleResetPassword)}>
   *   <Controller name="password" control={control} render={({ field }) => (
   *     <input type="password" {...field} />
   *   )}/>
   *   {errors.password && <p>{errors.password.message}</p>}
   * </form>
   * ```
   */
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(resetPasswordSchema),
  });

  /**
   * handleResetPassword
   *
   * @purpose Submit the new password to the server using the `token` from the URL and provide user feedback.
   *
   * @param {ResetPasswordSchemaType} data - The validated form data (typically contains `password` and `confirmPassword`).
   * @returns {Promise<void>} Resolves after the reset flow completes (success or handled error).
   * @sideEffects
   * - Calls `apiRequest("POST", "/api/parent/reset-password", payload)` to update the password on the server.
   * - Calls `reset()` from `react-hook-form` to clear the form on success.
   * - Shows a success toast on success and an error toast on failure.
   * - Navigates to the `/auth` route on success.
   * @throws none
   * - The function catches errors from the network call internally and therefore does not rethrow.
   *   If callers rely on thrown errors, note that this function handles them and reports with toasts.
   *
   * @example
   * ```ts
   * // Called by react-hook-form:
   * <form onSubmit={handleSubmit(handleResetPassword)}>...</form>
   *
   * // Example data (validated by zod):
   * handleResetPassword({ password: "newSecret123", confirmPassword: "newSecret123" });
   * ```
   */
  const handleResetPassword = async (data: ResetPasswordSchemaType) => {
    try {
      const payload = {
        token,
        password: data.password,
      };

      const response = await apiRequest(
        "POST",
        "/api/parent/reset-password",
        payload,
      );

      // Clear form fields
      reset();

      // Notify user of success
      toast({
        title: "Success",
        description: "Password reset successfully",
      });

      // Redirect to authentication page
      navigate("/auth");
    } catch (error) {
      // Log and notify user of error; error is handled here, not rethrown
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, hsl(358.68deg 81.98% 56.47%), hsl(238.06deg 44.5% 40.98%))",
      }}
    >
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card
            className="w-full max-w-md mx-auto"
            style={{ background: "#f7f3f2" }}
          >
            {/* Card Header */}
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                {/* Logo */}
                <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <img
                    src="/logo.jpeg"
                    alt="Institution Logo"
                    className="h-20 w-20 object-contain"
                  />
                </div>
              </div>
              {/* Card Title */}
              <CardTitle className="text-2xl font-bold text-center">
                Institution
              </CardTitle>
              {/* Card Description */}
              <CardDescription className="text-center">
                Login to access the management platform
              </CardDescription>
            </CardHeader>
            {/* Card Content */}
            <CardContent>
              <form
                onSubmit={handleSubmit(handleResetPassword)}
                className="space-y-4"
              >
                {/* Password Input */}
                <div className="space-y-2">
                  {" "}
                  <Label htmlFor="password">Password</Label>
                  <Controller
                    name={"password"}
                    control={control}
                    render={({ field }) => (
                      <Input type="password" id="password" {...field} />
                    )}
                  />
                  {errors?.password && (
                    <p className="text-sm text-red-500">
                      {errors.password?.message}
                    </p>
                  )}
                </div>
                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Controller
                    name={"confirmPassword"}
                    control={control}
                    render={({ field }) => (
                      <Input type="password" id="confirmPassword" {...field} />
                    )}
                  />
                  {errors?.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword?.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(358.68deg 81.98% 56.47%), hsl(238.06deg 44.5% 40.98%))",
                  }}
                >
                  Reset
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Content */}
        <div className="flex-1 p-12 text-white hidden md:flex md:flex-col md:justify-center">
          <div className="max-w-md mx-auto">
            {/* heading */}
            <h1 className="text-4xl font-bold mb-6">
              Intelligent Student Management System
            </h1>
            {/* description */}
            <p className="text-lg text-white/80 mb-6">
              A comprehensive solution for managing courses, batches,
              attendance, payments, and everything needed to run your music
              school efficiently.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                {/* Icon */}
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                {/* Feature - Course & Batch Management */}
                <div>
                  <h3 className="font-medium">Course & Batch Management</h3>
                  <p className="text-sm text-white/70">
                    Easily organize and schedule classes
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                {/* Feature - Attendance Tracking */}
                <div>
                  <h3 className="font-medium">Attendance Tracking</h3>
                  <p className="text-sm text-white/70">
                    Keep track of student attendance
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                {/* Feature - Payment Management */}
                <div>
                  <h3 className="font-medium">Payment Management</h3>
                  <p className="text-sm text-white/70">
                    Handle invoices and payments efficiently
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
