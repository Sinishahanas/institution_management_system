import { ChangePasswordForm } from "@/components/change-password-form";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, Building, Phone, Mail, User } from "lucide-react";

/**
 * ProfilePage
 *
 * @purpose Renders the profile page for the currently authenticated user. Displays user details such as full name, username, email, role, branch, phone number, and address. Also includes the `ChangePasswordForm` for updating the user's password.
 *
 * @param none
 * @returns {JSX.Element | null} Returns a JSX element rendering the user profile card and change password form. Returns `null` if no authenticated user is found.
 * @throws none
 * @sideEffects
 * - Reads user data from the authentication context via `useAuth`.
 * - Conditionally renders content based on authentication state.
 *
 * @example
 * ```tsx
 * import ProfilePage from "@/pages/ProfilePage";
 * function App() {
 *   return (
 *     <Routes>
 *       <Route path="/profile" element={<ProfilePage />} />
 *     </Routes>
 *   );
 * }
 * ```
 */
export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  /**
   * getInitials
   *
   * @purpose Generates initials from a user's full name for display in the avatar fallback.
   *
   * @param {string} name - The full name of the user.
   * @returns {string} Returns the uppercase initials derived from the user's name (e.g., "John Doe" → "JD").
   * @throws none
   * @sideEffects none
   *
   * @example
   * ```ts
   * getInitials("John Doe"); // returns "JD"
   * getInitials("Alice"); // returns "A"
   * ```
   */
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    // Main container for the entire profile page
    <div className="container py-10 pl-20">
      {/* Page title */}
      <h1 className="text-3xl font-bold mb-6 pl-10">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left section - User Info Card */}
        <div className="md:col-span-1">
          {/* Card displaying user information */}
          <Card>
            {/* Card header: avatar, name, and role */}
            <CardHeader className="flex flex-col items-center">
              {/* Avatar container for user profile picture or initials */}
              <Avatar className="h-24 w-24 mb-4">
                {/* Profile picture if available */}
                {/* {user.profilePicture ? (
                  <AvatarImage src={user.profilePicture} alt={user.fullName} />
                ) : null} */}
                {/* Fallback initials if no profile picture */}
                <AvatarFallback className="text-xl">{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
              {/* User full name */}
              <CardTitle className="text-xl text-center">{user.fullName}</CardTitle>
              {/* User role */}
              <div className="text-sm text-muted-foreground capitalize">{user.role}</div>
            </CardHeader>
            {/* Card content: user details */}
            <CardContent>
              {/* User details */}
              <div className="space-y-4">
                {/* Username */}
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>{user.username}</span>
                </div>
                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                {/* Phone number */}
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {/* Address */}
                {user.address && (
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <span>{user.address}</span>
                  </div>
                )}
                {/* Branch */}
                {user.branch && (
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <span>Branch: {user.branch}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right section - Password Change Form */}
        <div className="md:col-span-2">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}