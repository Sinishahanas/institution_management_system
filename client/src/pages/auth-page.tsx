import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockKeyhole, Mail, User, UserCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

/**
 * Login schema (Zod)
 *
 * @purpose Validates the login form fields.
 *
 * @param none
 * @returns {z.ZodObject<{ username: z.ZodString; password: z.ZodString }>} A Zod schema that enforces:
 *  - username: non-empty string
 *  - password: non-empty string
 * @throws none
 * @sideEffects none
 *
 * @example
 * ```ts
 * const result = loginSchema.safeParse({ username: "user", password: "pass" });
 * if (!result.success) console.log(result.error.format());
 * ```
 */
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

/**
 * Register schema (Zod)
 *
 * @purpose Validates the registration form fields and ensures passwords match.
 *
 * @param none
 * @returns {z.ZodEffects<z.ZodObject<...>>} A Zod schema that enforces:
 *  - username: string, min length 3
 *  - password: string, min length 6
 *  - confirmPassword: string (must match password)
 *  - email: valid email string
 *  - fullName: string, min length 3
 *  - role: one of ["parent", "teacher", "admin", "student", "branch_admin"]
 *  - branch: optional string
 * @throws none
 * @sideEffects none
 *
 * @example
 * ```ts
 * const payload = {
 *   username: "alice",
 *   password: "secure123",
 *   confirmPassword: "secure123",
 *   email: "alice@example.com",
 *   fullName: "Alice Doe",
 *   role: "teacher",
 *   branch: "Main Branch"
 * };
 *
 * const result = registerSchema.safeParse(payload);
 * if (!result.success) console.log(result.error.format());
 * ```
 */
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    email: z.string().email({ message: "Invalid email address" }),
    fullName: z.string().min(3, { message: "Full name is required" }),
    role: z.enum(["parent", "teacher", "admin", "student", "branch_admin"]),
    branch: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * LoginFormValues type
 *
 * @purpose Represents the shape of values validated by `loginSchema`.
 *
 * @param none
 * @returns {type} An inferred TypeScript type for login form values:
 *  - username: string
 *  - password: string
 * @throws none
 * @sideEffects none
 *
 * @example
 * ```ts
 * function onLogin(values: LoginFormValues) {
 *   // values.username and values.password are strongly typed strings
 * }
 * ```
 */
type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * RegisterFormValues type
 *
 * @purpose Represents the shape of values validated by `registerSchema`.
 *
 * @param none
 * @returns {type} An inferred TypeScript type for registration form values:
 *  - username: string
 *  - password: string
 *  - confirmPassword: string
 *  - email: string
 *  - fullName: string
 *  - role: "parent" | "teacher" | "admin" | "student" | "branch_admin"
 *  - branch?: string
 * @throws none
 * @sideEffects none
 *
 * @example
 * ```ts
 * function onRegister(values: RegisterFormValues) {
 *   // values.role is one of the defined role literals
 * }
 * ```
 */
type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * AuthPage component
 *
 * @purpose Renders authentication UI for login and registration, handles redirect for authenticated users, loads branch list, and wires up form submissions to auth mutations.
 *
 * @param none
 * @returns {JSX.Element} The authentication page component containing login/register forms.
 * @throws none
 * @sideEffects
 * - Uses React state to track `activeTab`.
 * - Uses navigation (`useLocation`) to redirect authenticated users.
 * - Triggers network/request side effects via `useQuery` (branches) and auth mutations.
 *
 * @example
 * ```tsx
 * import AuthPage from "@/pages/AuthPage";
 *
 * export default function App() {
 *   return <AuthPage />;
 * }
 * ```
 */
export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  /**
   * Redirect if already logged in.
   *
   * @purpose Redirects authenticated users to their role-specific dashboard.
   *
   * @param none
   * @returns none
   * @throws none
   * @sideEffects Calls `navigate` to change the route synchronously during render.
   *
   * @example
   * ```ts
   * // If `user.role === "teacher"`, user will be navigated to "/teacher/dashboard"
   * ```
   */
  if (user) {
    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user.role === "teacher") {
      navigate("/teacher/dashboard");
    } else if (user.role === "parent") {
      navigate("/parent/dashboard");
    } else if (user.role === "student") {
      navigate("/student/dashboard");
    } else if (user.role === "branch_admin") {
      navigate("/branch-admin/dashboard");
    }
  }

  /**
   * Branches query
   *
   * @purpose Loads the list of branches for the registration form's branch selector.
   *
   * @param none
   * @returns {Object} React Query result object with:
   *  - data: any[] (defaults to [])
   *  - isLoading: boolean
   * @throws none
   * @sideEffects Fetches data from `/api/branches`.
   *
   * @example
   * ```ts
   * const { data: branches = [], isLoading } = useQuery({ queryKey: ["/api/branches"] });
   * ```
   */
  const { data: branches = [], isLoading: isLoadingBranches } = useQuery<any[]>(
    {
      queryKey: ["/api/branches"],
    },
  );

  /**
   * Login form (react-hook-form)
   *
   * @purpose Manages login form state and validation using `loginSchema`.
   *
   * @param none
   * @returns {Object} react-hook-form methods and state for the login form.
   * @throws none
   * @sideEffects none
   *
   * @example
   * ```ts
   * // Access with loginForm.handleSubmit or loginForm.register("username")
   * ```
   */
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  /**
   * Register form (react-hook-form)
   *
   * @purpose Manages registration form state and validation using `registerSchema`.
   *
   * @param none
   * @returns {Object} react-hook-form methods and state for the registration form.
   * @throws none
   * @sideEffects none
   *
   * @example
   * ```ts
   * // Access with registerForm.handleSubmit or registerForm.register("email")
   * ```
   */
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
      role: "admin",
      branch: "",
    },
  });

  /**
   * Handle login form submission
   *
   * @purpose Submits login data to the auth `loginMutation` and navigates to root on success.
   *
   * @param {LoginFormValues} data - Data validated by `loginSchema`.
   * @returns {void}
   * @throws none
   * @sideEffects Calls `loginMutation.mutate` which performs a network request and on success calls `navigate("/")`.
   *
   * @example
   * ```ts
   * onLoginSubmit({ username: "alice", password: "secure123" });
   * ```
   */
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  /**
   * Handle register form submission
   *
   * @purpose Submits registration data to the auth `registerMutation` and navigates to root on success.
   *
   * @param {RegisterFormValues} data - Data validated by `registerSchema`.
   * @returns {void}
   * @throws none
   * @sideEffects Calls `registerMutation.mutate` which performs a network request and on success calls `navigate("/")`.
   *
   * @example
   * ```ts
   * onRegisterSubmit({
   *   username: "bob",
   *   password: "password123",
   *   confirmPassword: "password123",
   *   email: "bob@example.com",
   *   fullName: "Bob Smith",
   *   role: "teacher",
   *   branch: "Main Branch"
   * });
   * ```
   */
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  /**
   * AuthPage Render Block
   *
   * @purpose Renders the authentication UI including branding, login form, and tabs.
   *
   * @param none
   * @returns {JSX.Element} The JSX structure for the auth page (background, card, tabs, login form).
   * @throws none
   * @sideEffects
   * - Renders UI to the DOM.
   * - Triggers navigation when forms are submitted (via onLoginSubmit/onRegisterSubmit).
   * - Uses controlled form state (react-hook-form) which will validate and cause re-renders.
   *
   * @example
   * ```tsx
   * // Inside AuthPage component:
   * return (
   *   // JSX below
   * );
   * ```
   */
  return (
    // Outer container with a diagonal gradient background
    <div
      style={{
        background:
          "linear-gradient(135deg, hsl(358.68deg 81.98% 56.47%), hsl(238.06deg 44.5% 40.98%))",
      }}
    >
      {/* A full-screen flex container that splits into two columns on larger screens */}
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-6">
          {/* Card wrapper for the login form */}
          <Card
            className="w-full max-w-md mx-auto"
            style={{ background: "#f7f3f2" }}
          >
            {/* Card header with logo and title */}
            <CardHeader className="space-y-1">
              {/* Logo section */}
              <div className="flex items-center justify-center mb-4">
                <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <img
                    src="/logo.jpeg"
                    alt="Institution Logo"
                    className="h-20 w-20 object-contain"
                  />
                </div>
              </div>
              {/* Title section */}
              <CardTitle className="text-2xl font-bold text-center">
                Institution
              </CardTitle>
              {/* Description section */}
              <CardDescription className="text-center">
                Login to access the management platform
              </CardDescription>
            </CardHeader>
            {/* Card content with tabs and forms */}
            <CardContent>
              {/* Tabs for login and register */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-1 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      {/* Username field */}
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              {/* Relative container to position the icon */}
                              <div className="relative">
                                {/* User icon */}
                                <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                {/* Input field with padding for icon */}
                                <Input
                                  placeholder="Enter your username"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Password field */}
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              {/* Relative container to position the icon */}
                              <div className="relative">
                                {/* Lock icon */}
                                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                {/* Input field with padding for icon */}
                                <Input
                                  type="password"
                                  placeholder="Enter your password"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Submit button */}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        style={{
                          background:
                            "linear-gradient(135deg, hsl(358.68deg 81.98% 56.47%), hsl(238.06deg 44.5% 40.98%))",
                        }}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Log in"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register">
                  {/* Form wrapper for registration */}
                  <Form {...registerForm}>
                    {/* Registration form */}
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      {/* Full Name field */}
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            {/* Full Name field */}
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              {/* Relative container to position the icon */}
                              <div className="relative">
                                {/* User icon */}
                                <UserCircle className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                {/* Input field with padding for icon */}
                                <Input
                                  placeholder="Enter your full name"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Email field */}
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            {/* Email field */}
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              {/* Relative container to position the icon */}
                              <div className="relative">
                                {/* Mail icon */}
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                {/* Input field with padding for icon */}
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Username field */}
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            {/* Username field */}
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              {/* Relative container to position the icon */}
                              <div className="relative">
                                {/* User icon */}
                                <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                {/* Input field with padding for icon */}
                                <Input
                                  placeholder="Choose a username"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Role selection */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              {/* Role selection */}
                              <FormLabel>Role</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="branch_admin">
                                    Branch Admin
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {/* Branch selection */}
                        <FormField
                          control={registerForm.control}
                          name="branch"
                          render={({ field }) => (
                            <FormItem>
                              {/* Branch selection */}
                              <FormLabel>Branch</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select branch" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {branches.map((branch) => (
                                    <SelectItem
                                      key={branch.id}
                                      value={branch.name}
                                    >
                                      {branch.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {/* Password field */}
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            {/* Password field */}
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                <Input
                                  type="password"
                                  placeholder="Create a password"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Confirm Password field */}
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            {/* Confirm Password field */}
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                <Input
                                  type="password"
                                  placeholder="Confirm your password"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Submit button */}
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                        // Gradient background
                        style={{
                          background:
                            "linear-gradient(135deg, hsl(358.68deg 81.98% 56.47%), hsl(238.06deg 44.5% 40.98%))",
                        }}
                      >
                        {/* change text when loading */}
                        {registerMutation.isPending
                          ? "Creating account..."
                          : "Create account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>

            {/* Footer */}
            <CardFooter className="flex flex-col">
              <div className="text-sm text-neutral-500 text-center mt-4">
                {/* Toggle between login and register */}
                {activeTab === "login" ? (
                  <span>
                    Don't have an account? {/* Link to register */}
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={() => setActiveTab("register")}
                    >
                      Create one
                    </Button>
                  </span>
                ) : (
                  <span>
                    Already have an account? {/* Link to login */}
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={() => setActiveTab("login")}
                    >
                      Log in
                    </Button>
                  </span>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right side section */}
        {/* This section is displayed on medium screens and larger (hidden on mobile). 
        It visually balances the login/register card with a hero message and features. */}
        <div className="flex-1 p-12 text-white hidden md:flex md:flex-col md:justify-center">
          <div className="max-w-md mx-auto">
            {/* Main heading */}
            <h1 className="text-4xl font-bold mb-6">
              Intelligent Student Management System
            </h1>
            {/* Description text below the heading */}
            <p className="text-lg text-white/80 mb-6">
              A comprehensive solution for managing courses, batches,
              attendance, payments, and everything needed to run your music
              school efficiently.
            </p>
            {/* List of features */}
            <div className="space-y-4">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                {/* === Feature 1: Course & Batch Management === */}
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
                {/* === Feature 2: Attendance Tracking === */}
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
                {/* === Feature 3: Payment Management === */}
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
