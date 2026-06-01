import { useState, useEffect } from "react";
import { Header } from "./header";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { useLocation } from "wouter";

/**
 * Props for the AppShell component.
 */

interface AppShellProps {
  /** The main content of the application that will be rendered inside the layout. */
  children: React.ReactNode;
}

/**
 * AppShell Component
 *
 * @purposes
 * Provides the main application layout with a header, sidebar, and responsive behavior.
 * - Manages the application shell that wraps around all pages.
 * - Includes a top `Header` and a collapsible sidebar (`SidebarNav`) for navigation.
 * - Handles responsive layouts:
 *   - On mobile (`<768px`), the sidebar is hidden by default and shown with an overlay.
 *   - On desktop, the sidebar is visible by default.
 * - Closes the sidebar automatically when navigating on mobile.
 * - Provides a toggle mechanism for opening/closing the sidebar.
 *
 * @param {AppShellProps} props - Component props.
 * @param {React.ReactNode} props.children - Main content to render inside the layout.
 * @returns {JSX.Element} The complete application shell layout with header, sidebar, and main content.
 * @sideEffects
 * - Listens to window resize events to handle responsive layout.
 * - Closes the sidebar automatically on mobile when navigation changes.
 * @throws Will throw if `children` is not provided.
 * 
 * @example
 * ```tsx
 * <AppShell>
 *   <DashboardPage />
 * </AppShell>
 * ```
 */
export function AppShell({ children }: AppShellProps) {
  // Sidebar open/close state (true = open by default on desktop)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Tracks whether the user is on a mobile device
  const [isMobile, setIsMobile] = useState(false);

  // React Router hook to track route changes
  const [location] = useLocation();

  /**
   * @purpose
   * - Closes the sidebar when navigation occurs on mobile.
   * - Ensures that after clicking a link, the sidebar collapses automatically improving user experience on smaller screens.
   *
   * @param {string} location - The current route location.
   * @param {boolean} isMobile - Whether the user is on a mobile device.
   * @returns {void}
   * @sideEffects
   * - Closes the sidebar automatically on mobile when navigation changes.
   * @throws Will throw if `location` or `isMobile` is not provided.
   * 
   * @example
   * ```tsx
   * useEffect(() => {
   *   if (isMobile) {
   *     setIsSidebarOpen(false);
   *   }
   * }, [location, isMobile]);
   * ```
   */
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  /**
   * @purpose
   * - Handles window resize to switch between mobile and desktop layouts.
   * - Mobile: width < 768px → sidebar hidden by default.
   * - Desktop: width ≥ 768px → sidebar shown by default.
   *
   * @returns {void}
   * @sideEffects
   * - Adjusts the sidebar state based on window width.
   * @throws Will throw if `window` is not available.
   * 
   * @example
   * ```tsx
   * useEffect(() => {
   *   const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call initially

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Initialize layout state based on current window size
    handleResize(); // Call initially

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /**
   * @purpose
   * - Toggles the sidebar open/closed state.
   *
   * @returns {void}
   * @sideEffects
   * - Updates the `isSidebarOpen` state.
   * @throws Will throw if `isSidebarOpen` is not provided.
   * 
   * @example
   * ```tsx
   * const toggleSidebar = () => {
   *   setIsSidebarOpen(!isSidebarOpen);
   * };
   * ```
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      {/* Header always visible */}
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with optional overlay for mobile */}
        {isSidebarOpen && (
          <>
            {/* Mobile overlay */}
            <div 
              className="fixed inset-0 bg-black/50 z-10 md:hidden" 
              onClick={toggleSidebar}
            />
            
            {/* Sidebar */}
            <aside 
              className="bg-white w-64 border-r border-neutral-200 shadow-sm flex-shrink-0 fixed md:static h-full z-20 transition-all duration-300"
            >
              <SidebarNav 
                isMobile={isMobile} 
                closeMobileMenu={() => setIsSidebarOpen(false)}
              />
            </aside>
          </>
        )}
        
        {/* Main content area*/}
        <main className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${isSidebarOpen ? 'md:ml-0' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
