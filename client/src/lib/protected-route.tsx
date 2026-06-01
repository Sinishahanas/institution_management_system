import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

/**
 * @purpose Type definition for the protected route component.
 *
 * @property {string} path - The route path (e.g., "/dashboard")
 * @property {React.ComponentType} component - The React component to render if access is allowed
 * @property {string[]} [allowedRoles] - Optional list of roles allowed to access the route
 */
type ProtectedRouteProps = {
  /** Route path to match */
  path: string;

  /** React component to render if access is allowed */
  component: React.ComponentType;

  /** Optional list of allowed user roles */
  allowedRoles?: string[];
};


/**
 * @purpose A wrapper route component that protects access based on authentication and user role.
 *
 * @param {ProtectedRouteProps} props - Props for the protected route
 * @returns {JSX.Element} The Route component, a loader, or a redirect if unauthorized
 * @throws Will not throw errors, but will redirect or render an "Access Denied" message
 * @sideEffects Redirects the user to login or role-specific dashboard if access is denied
 *
 * @example
 * <ProtectedRoute
 *   path="/admin/dashboard"
 *   component={AdminDashboard}
 *   allowedRoles={["admin"]}
 * />
 */
export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Show loading spinner while user auth status is being fetched
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // If user is not logged in, redirect to authentication page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if user role is allowed (if roles are specified)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 text-center">
            You don't have permission to access this page.
          </p>

          {/* Redirect users based on their role */}
          {user.role === "admin" && <Redirect to="/admin/dashboard" />}
          {user.role === "branch_admin" && <Redirect to="/branch-admin/dashboard" />}
          {user.role === "teacher" && <Redirect to="/teacher/dashboard" />}
          {user.role === "parent" && <Redirect to="/parent/dashboard" />}
        </div>
      </Route>
    );
  }
  
  // Render the protected route component if access is allowed
  return <Route path={path} component={Component} />;
}
