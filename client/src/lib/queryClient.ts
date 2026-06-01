import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * @purpose Throws an error if a Response object is not OK.
 *
 * @param {Response} res - The fetch API Response object.
 * @returns {Promise<void>} Resolves if response is OK, otherwise throws an Error.
 * @throws {Error} If the response status is not OK, with status code and message.
 * @sideEffects None
 * 
 * @example
 * const res = await fetch("/api/users");
 * await throwIfResNotOk(res); // Throws if status is not 200-299
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to get response text, fallback to statusText
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * @purpose Performs an API request using fetch with JSON body and credentials included.
 *
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.).
 * @param {string} url - URL of the API endpoint.
 * @param {unknown} [data] - Optional request body data (will be JSON.stringified).
 * @returns {Promise<Response>} Resolves to the fetch Response object if successful.
 * @throws {Error} If the response status is not OK.
 * @sideEffects Uses fetch API with credentials included.
 * 
 * @example
 * const res = await apiRequest("POST", "/api/login", { username, password });
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Include cookies for auth
  });

  await throwIfResNotOk(res); // Throws if response is not OK
  return res;
}

/**
 * @purpose Type definition for the behavior when a 401 response is received.
 *
 * @property {"returnNull" | "throw"} on401 - Behavior when a 401 response is received:
 *      - "returnNull": returns null
 *      - "throw": throws an error
 */
type UnauthorizedBehavior = "returnNull" | "throw";


/**
 * @purpose Returns a React-Query function that handles unauthorized responses.
 *
 * @template T - The expected return type of the query.
 * @param {Object} options - Options object.
 * @param {UnauthorizedBehavior} options.on401 - Behavior when a 401 response is received:
 *      - "returnNull": returns null
 *      - "throw": throws an error
 * @returns {QueryFunction<T>} Query function for react-query.
 *
 * @sideEffects Uses fetch API with credentials included.
 * @throws {Error} If response is not OK and on401 is "throw".
 *
 * @example
 * const fetchUser = getQueryFn<{ name: string }>({ on401: "returnNull" });
 * const user = await fetchUser({ queryKey: ["/api/user"] });
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    // Return null instead of throwing for 401 if specified
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res); // Throws if response is not OK
    return await res.json(); // Returns the response body as JSON
  };


/**
 * @purpose React Query client instance configured with default options.
 *
 * @param {Object} defaultOptions - Default query and mutation options.
 * @param {QueryFunction} defaultOptions.queries.queryFn - Default query function using getQueryFn.
 * @param {boolean} defaultOptions.queries.refetchInterval - Queries are not refetched automatically.
 * @param {boolean} defaultOptions.queries.refetchOnWindowFocus - Queries do not refetch on window focus.
 * @param {number} defaultOptions.queries.staleTime - Queries are considered fresh indefinitely.
 * @param {boolean} defaultOptions.queries.retry - Queries do not retry on failure by default.
 * @param {boolean} defaultOptions.mutations.retry - Mutations do not retry on failure by default.
 * @returns {QueryClient} A configured QueryClient instance
 * @throws {Error} Throws if `getQueryFn` encounters a 401 response and is configured to throw
 * @sideEffects
 * - Initializes a global React Query client instance
 * - Configures default behavior for queries and mutations
 * - Will cause fetch requests to automatically include credentials if used via `getQueryFn`
 *
 * @example
 * import { useQuery } from "@tanstack/react-query";
 * const { data } = useQuery(["/api/user"]);
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
