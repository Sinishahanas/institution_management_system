import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

/**
 * NotFound Component
 *
 * @purpose Displays a user-friendly 404 error page when a requested route or page is not found in the application router.
 *
 * @param none
 * @returns {JSX.Element} A styled React component that visually indicates a missing page. The component shows an alert icon, a "404 Page Not Found" heading, and a short message suggesting that the route may be missing from the router configuration.
 * @throws none
 * @sideEffects none
 *
 * @example
 * ```tsx
 * import NotFound from "@/pages/not-found";
 *
 * // Usage in a router configuration:
 * <Route path="*" element={<NotFound />} />
 * ```
 */
export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      {/* A Card component acts as the container for the 404 content. */}
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          {/* Displays the main 404 error heading with an icon. */}
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          {/* Provides additional guidance to developers or users about a missing route. */}
          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
