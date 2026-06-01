// API configuration
// const API_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** Options for the API request */
interface ApiRequestOptions {
  headers?: Record<string, string>;
  /** Optional request body */
  body?: any;
}

/**
 * @purpose Makes an HTTP API request to the specified endpoint with optional data.
 *
 * @param {string} method - HTTP method to use (GET, POST, PUT, DELETE, etc.)
 * @param {string} endpoint - API endpoint to call (e.g., '/api/users')
 * @param {any} [data] - Optional data to send in the request body
 * @returns {Promise<Response>} The fetch response object
 * @sideEffects Reads `authToken` from localStorage, may clear it on 401, and may redirect the browser to /login
 * @throws {Error} Throws an error if the response is unauthorized (401) or any other non-OK status
 *
 * @example
 * try {
 *   const response = await apiRequest('POST', '/api/login', { username: 'user', password: 'pass' });
 *   const data = await response.json();
 *   console.log(data);
 * } catch (error) {
 *   console.error(error);
 * }
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<Response> {
  const options: ApiRequestOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add request body for non-GET requests
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  // Get the stored auth token
  const token = localStorage.getItem('authToken');
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      ...options,
    });

    // Handle unauthorized responses
    if (response.status === 401) {
      // Clear stored token
      localStorage.removeItem('authToken');
      // Redirect to login page
      window.location.href = '/login';
      throw new Error('Unauthorized access');
    }

    // Handle other error responses
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}