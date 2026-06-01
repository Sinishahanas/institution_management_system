import { FaWhatsapp, FaGlobe } from "react-icons/fa";
import { Globe } from "lucide-react";

/**
 * FixedFooter Component
 *
 * @purpose
 * - Renders a fixed action footer for "parent" users, providing quick access to WhatsApp contact and the website.
 * - This footer is conditionally rendered only for users with the role `parent`.
 * - Displays two floating action buttons on the bottom-right corner of the screen:
 *   - **WhatsApp button**: Opens a predefined WhatsApp chat link in a new tab.
 *   - **Website button**: Redirects users to the official Institution website in a new tab.
 * - Both buttons have hover animations and are styled as circular icons with shadows.
 *
 * @param {object} props - Component props.
 * @param {object} props.user - Current user object.
 * @param {string} props.user.role - User's role; must be `"parent"` to render buttons.
 * @returns {JSX.Element | null} Rendered footer buttons if `user.role === "parent"`, otherwise `null`.
 * @sideEffects Opens external pages in new tabs when buttons are clicked.
 * @throws Will throw if `user` is undefined or `user.role` is not a string.
 *
 * @example
 * ```tsx
 * <FixedFooter user={{ role: "parent" }} />
 * ```
 *
 * This will display the WhatsApp and Website floating buttons on the screen.
 */
export function FixedFooter({ user }: { user: any }) {
  if (user?.role !== "parent") return null; // Return null if user is not a parent

  return (
    <div className="fixed bottom-12 right-8 z-50 flex flex-col space-y-4">
      {/* WhatsApp button */}
      <a
        href={import.meta.env.VITE_WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp us"
        className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <FaWhatsapp className="h-6 w-6" />
      </a>

      {/* Website button */}
      <a
        href={import.meta.env.VITE_WEBSITE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        title="Visit us on website"
        className="bg-primary text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <FaGlobe className="h-6 w-6" />
      </a>
    </div>
  );
}
