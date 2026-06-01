import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { z } from "zod";
import { insertUserSchema, User as SelectUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";


/**
 * @typedef AuthContextType
 * @description
 * Represents the shape of the authentication context provided by `AuthProvider`.
 * It contains the current user, loading and error states, and mutations for login, logout, and registration.
 *
 * @property {SelectUser | null} user - The currently authenticated user, or null if no user is logged in.
 * @property {boolean} isLoading - True when the authentication state is being fetched or a mutation is in progress.
 * @property {Error | null} error - Any error encountered during fetching or mutating authentication data.
 * @property {UseMutationResult<Omit<SelectUser, "password">, Error, LoginData>} loginMutation - Mutation object to log in a user.
 * @property {UseMutationResult<void, Error, void>} logoutMutation - Mutation object to log out the current user.
 * @property {UseMutationResult<Omit<SelectUser, "password">, Error, RegisterData>} registerMutation - Mutation object to register a new user.
 *
 * @throws {Error} N/A directly, but the mutation objects may throw errors when used.
 * @sideEffects The mutation objects update the global query cache (`react-query`) and may trigger UI toasts.
 *
 * @example
 * const { user, loginMutation, logoutMutation, registerMutation } = useAuth();
 *
 * // Login example
 * loginMutation.mutate({ username: "johndoe", password: "123456" });
 *
 * // Logout example
 * logoutMutation.mutate();
 *
 * // Registration example
 * registerMutation.mutate({
 *   username: "janedoe",
 *   password: "123456",
 *   confirmPassword: "123456",
 *   email: "jane@example.com",
 *   fullName: "Jane Doe",
 *   role: "user",
 *   phone: "1234567890",
 *   address: "123 Main St",
 *   branch: "HQ"
 * });
 */
type AuthContextType = {

  /** Currently authenticated user, null if not logged in */
  user: SelectUser | null;
  // user: Omit<SelectUser, "password"> | null;

  /** True if a query/mutation is loading */
  isLoading: boolean;

  /** Error object if any request failed */
  error: Error | null;

  /** Mutation to login a user */
  loginMutation: UseMutationResult<Omit<SelectUser, "password">, Error, LoginData>;
  
  /** Mutation to logout the user */
  logoutMutation: UseMutationResult<void, Error, void>;
  
  /** Mutation to register a new user */
  registerMutation: UseMutationResult<Omit<SelectUser, "password">, Error, RegisterData>;
};

/**
 * @purpose Schema to validate login data.
 *
 * @param username - Required username string
 * @param password - Required password string
 * @returns {LoginData} The validated login data
 * @throws ValidationError if username or password are empty
 * @sideEffects None
 * 
 * @example
 * ```tsx
 * const loginData = loginSchema.parse({ username: "admin", password: "123456" });
 * ```
 */
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});


/**
 * @purpose
 * Schema to validate registration data based on the `insertUserSchema`.
 * Ensures required fields, password length, and that password matches confirmPassword.
 *
 * @param username - Required username string
 * @param password - Required password string
 * @param confirmPassword - Required confirmation password string
 * @param email - Required email string
 * @param fullName - Required full name string
 * @param role - Required role string
 * @param phone - Required phone number string
 * @param address - Required address string
 * @param branch - Required branch string
 *
 * @returns {RegisterData} The validated registration data
 * @throws ValidationError if passwords don't match or required fields are missing
 * @sideEffects None.
 * 
 * @example
 * const data = registerSchema.parse({
 *   username: "janedoe",
 *   password: "123456",
 *   confirmPassword: "123456",
 *   email: "jane@example.com",
 *   fullName: "Jane Doe",
 *   role: "user",
 *   phone: "1234567890",
 *   address: "123 Main St",
 *   branch: "HQ"
 * });
 */
const registerSchema = insertUserSchema.pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
  phone: true,
  address: true,
  branch: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


/** Type representing login form data */
type LoginData = z.infer<typeof loginSchema>;

/** Type representing registration form data */
type RegisterData = z.infer<typeof registerSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * @purpose
 * - Provides authentication state and actions (login, logout, register) to React components.
 * - Wrap your application or a subtree with this provider to enable access to the current user and authentication-related mutations.
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - React children to render inside the provider
 * @returns {JSX.Element} Auth context provider wrapping children
 * @throws Error if the API request fails
 * @sideEffects Uses React Query to fetch user data, performs API requests for login, logout, and registration.
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  /**
   * @purpose
   * - Fetches the currently logged-in user.
   * 
   * @param {Object} props - Component props
   * @param {ReactNode} props.children - React children to render inside the provider
   * @returns {SelectUser | null} The currently logged-in user, or null if no user is logged in.
   * @throws Error if the API request fails
   * @sideEffects Uses React Query to fetch user data, performs API requests for login, logout, and registration.
   *
   * @example
   * <AuthProvider>
   *   <App />
   * </AuthProvider>
   */
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<Omit<SelectUser, "password"> | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  /**
   * @purpose Logs in a user using provided credentials.
   *
   * @param {LoginData} credentials - User login information
   * @returns {Promise<Omit<SelectUser, "password">>} Logged-in user data
   * @throws Error if the API request fails
   * @sideEffects Updates React Query cache and shows toast notifications
   *
   * @example
   * loginMutation.mutate({ username: "john", password: "secret123" });
   */
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData: Omit<SelectUser, "password">) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  /**
   * @purpose Registers a new user.
   *
   * @param {RegisterData} userData - User registration information
   * @returns {Promise<Omit<SelectUser, "password">>} Newly registered user data
   * @throws Error if the API request fails
   * @sideEffects Updates React Query cache and shows toast notifications
   *
   * @example
   * registerMutation.mutate({
   *   username: "jane",
   *   password: "secret123",
   *   confirmPassword: "secret123",
   *   email: "jane@example.com",
   *   fullName: "Jane Doe",
   *   role: "admin",
   *   phone: "123456789",
   *   address: "123 Main St",
   *   branch: "HQ"
   * });
   */
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      // Remove confirmPassword before sending to the server
      const { confirmPassword, ...userDataToSend } = userData;
      const res = await apiRequest("POST", "/api/register", userDataToSend);
      return await res.json();
    },
    onSuccess: (userData: Omit<SelectUser, "password">) => {
      queryClient.setQueryData(["/api/user"], userData);
      toast({
        title: "Registration successful",
        description: `Welcome, ${userData.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  /**
   * @purpose Logs out the currently logged-in user.
   *
   * @param {Object} props - Component props
   * @param {ReactNode} props.children - React children to render inside the provider
   * @returns {Promise<void>}
   * @throws Error if the API request fails
   * @sideEffects Clears React Query user cache and shows toast notification
   *
   * @example
   * logoutMutation.mutate();
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


/**
 * @purpose Custom hook to access authentication context.
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - React children to render inside the provider
 * @returns {AuthContextType} Returns the authentication context, including:
 *  - `user`: the currently authenticated user or null
 *  - `isLoading`: whether the auth state is loading
 *  - `error`: any error encountered while fetching auth state
 *  - `loginMutation`, `logoutMutation`, `registerMutation`: React Query mutation objects for authentication actions
 * @throws Throws an error if used outside of an `AuthProvider`.
 * @sideEffects None directly, but calling mutation methods (`loginMutation.mutate`, etc.) will trigger network requests and toast notifications.
 *
 * @example
 * ```tsx
 * const { user, loginMutation } = useAuth();
 * loginMutation.mutate({ username: "admin", password: "123456" });
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
