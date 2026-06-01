import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Bell, ChevronDown, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { FaGlobe, FaWhatsapp } from "react-icons/fa";

interface HeaderProps {
  /**
   * Callback to toggle the sidebar visibility.
   * Typically used for mobile and smaller screens.
   */
  toggleSidebar: () => void;
}

/**
 * Header Component
 *
 * @purpose
 *   Renders the top navigation header for the application including logo, user info,
 *   role badge, and a dropdown menu for profile/settings/logout actions. On mobile,
 *   provides a button to toggle the sidebar.
 *
 * @param {HeaderProps} props - Props object.
 * @param {() => void} props.toggleSidebar - Function to toggle sidebar visibility.
 * @returns {JSX.Element} React element representing the application header.
 * @sideEffects Calls `logoutMutation.mutate()` and navigates to "/auth" on logout.
 * @throws Will throw if `useAuth` hook fails or returns invalid user object.
 *
 * @example
 * ```tsx
 * <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
 * ```
 */
export function Header({ toggleSidebar }: HeaderProps) {
  // Retrieve authenticated user data and logout functionality from auth context
  const { user, logoutMutation } = useAuth();

  // Hook for navigation (from React Router or Wouter)
  const [, navigate] = useLocation();
  // const [notificationCount] = useState(3);

  /**
   * @purpose Get initials from a full name.
   *
   * @param {string} name - Full name of the user.
   * @returns {string} Uppercase initials.
   * @throws Will throw if `name` is empty or not a string.
   *
   * @example
   * ```tsx
   * const initials = getInitials("John Doe"); // Returns "JD"
   * ```
   */
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  /**
   * @purpose Handles logging out the current user.
   *
   * @param None.
   * @returns {void}
   * @sideEffects
   *   - Calls the logout mutation to clear session/auth state.
   *   - Redirects the user to the `/auth` page after logout.
   * @throws Will throw if `logoutMutation` is undefined or `navigate` fails.
   *
   * @example
   * ```tsx
   * const handleLogout = () => {
   *   logoutMutation.mutate();
   *   navigate("/auth");
   * };
   * ```
   */
  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/auth");
  };

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      {/* Header container */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left section: Sidebar toggle and branding */}
        <div className="flex items-center">
          {/* Mobile sidebar toggle button */}
          <button
            className="mr-2 p-2 rounded-md text-neutral-500 hover:bg-neutral-100 md:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo and brand name */}
          <div className="flex items-center">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center mr-2 shadow-sm">
              <img
                src="/jazzLogo.jpeg"
                alt="Institution Logo"
                className="h-9 w-9 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-primary">Institution</span>

            {/* Role badge */}
            <span className="ml-2 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
              {user?.role.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right section: User menu */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center">
              {/* Avatar with initials */}
              <Avatar className="h-10 w-10 bg-primary">
                <AvatarFallback>
                  {user ? getInitials(user.fullName) : "U"}
                </AvatarFallback>
              </Avatar>

              {/* User info */}
              <div className="hidden md:block ml-2">
                <div className="font-medium text-sm text-neutral-900">
                  {user?.fullName}
                </div>
                <div className="text-xs text-neutral-500">
                  {user?.branch || "Main Branch"}
                </div>
              </div>

              {/* Dropdown */}
              <ChevronDown className="ml-2 h-5 w-5 text-neutral-500" />
            </DropdownMenuTrigger>

            {/* Dropdown content */}
            <DropdownMenuContent align="end" className="w-56">
              {/* User info */}
              <div className="px-2 py-1.5 text-sm font-medium text-neutral-900 md:hidden">
                {user?.fullName}
              </div>
              <div className="px-2 py-1.5 text-xs text-neutral-500 md:hidden">
                {user?.branch || "Main Branch"}
              </div>
              <DropdownMenuSeparator className="md:hidden" />

              {/* Navigation links */}
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
