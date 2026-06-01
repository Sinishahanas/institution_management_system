import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { CreditCard, DollarSign, Users, Layers, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

/**
 * Interface representing the dashboard statistics fetched from the API.
 */
interface DashboardStats {
  /** Total revenue generated */
  totalRevenue: number;
  
   /** Amount of pending payments */
  pendingPayments: number;

  /** Number of active students */
  activeStudents: number;

  /** Number of active batches */
  activeBatches: number;
}

/**
 * StatCards component
 *
 * @purpose 
 * - Displays key dashboard statistics using StatCard components.
 * - Fetches dashboard stats via React Query from `/api/dashboard/stats`.
 * - Shows a loading skeleton while data is being fetched.
 * - Handles API errors and displays an error message.
 * - Displays four StatCards: Total Revenue, Active Students, Active Batches, Pending Payments.
 * - Each card includes an icon, color, and trend indicator (hardcoded for now).
 * 
 * @param {DashboardStats} data - The dashboard statistics data.
 * @returns {JSX.Element} The rendered dashboard statistic cards.
 * @sideEffects
 * - Fetches data from the API endpoint.
 * - Updates cards when data is received.
 * @throws Will throw if `data` is missing or invalid from the API response.
 *
 * @example
 * <StatCards />
 */
export function StatCards() {
  /**
   * Fetch dashboard stats from the API using React Query.
   * 
   * @type {UseQueryResult<DashboardStats>}
   */
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    // Display loading skeleton while fetching data
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Render 4 loading skeletons to mimic StatCards layout */}
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                <div className="h-8 w-32 bg-neutral-200 rounded"></div>
              </div>
              <div className="rounded-full p-2 bg-neutral-200 h-10 w-10"></div>
            </div>
            <div className="h-4 w-36 bg-neutral-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    // Display error message if API request fails
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-600">Error loading dashboard stats: {error.message}</p>
      </div>
    );
  }

  // Render the actual statistic cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Revenue Card to display total revenue generated */}
      <StatCard
        title="Total Revenue"
        value={formatCurrency(data?.totalRevenue || 0)}
        icon={Wallet}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
        trend={{
          value: 12.5,
          label: "vs last month",
          positive: true
        }}
      />
      
      {/* Active Students Card to display total number of active students */}
      <StatCard
        title="Active Students"
        value={data?.activeStudents || 0}
        icon={Users}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100"
        trend={{
          value: 3.2,
          label: "vs last month",
          positive: true
        }}
      />
      
      {/* Active Batches Card to display total number of active batches */}
      <StatCard
        title="Active Batches"
        value={data?.activeBatches || 0}
        icon={Layers}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
        trend={{
          value: 5.7,
          label: "vs last month",
          positive: true
        }}
      />
      
      {/* Pending Payments Card to display total amount of pending payments */}
      <StatCard
        title="Pending Payments"
        value={formatCurrency(data?.pendingPayments || 0)}
        icon={CreditCard}
        iconColor="text-amber-600"
        iconBgColor="bg-amber-100"
        trend={{
          value: 8.3,
          label: "vs last month",
          positive: false
        }}
      />
    </div>
  );
}