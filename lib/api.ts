import axios from "axios";

// Create axios instance with no-cache defaults for all requests
const apiClient = axios.create({
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// Add request interceptor to ensure no-cache headers on every request
apiClient.interceptors.request.use(
  (config) => {
    // Ensure no-cache headers are always present
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";

    // Add timestamp to prevent browser caching
    if (config.method === "get") {
      const separator = config.url?.includes("?") ? "&" : "?";
      config.url = `${config.url}${separator}_t=${Date.now()}`;
    }

    console.log(
      "API Request (No-Cache):",
      config.method?.toUpperCase(),
      config.url
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to ensure no-cache headers on responses
apiClient.interceptors.response.use(
  (response) => {
    // Log successful API responses
    console.log(
      "API Response (Fresh):",
      response.config.method?.toUpperCase(),
      response.config.url
    );
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.config?.method?.toUpperCase(),
      error.config?.url,
      error.message
    );
    return Promise.reject(error);
  }
);

export default apiClient;

// Export convenience methods with proper types
export const api = {
  get: <T = unknown>(url: string, config?: object) =>
    apiClient.get<T>(url, config),
  post: <T = unknown>(url: string, data?: unknown, config?: object) =>
    apiClient.post<T>(url, data, config),
  put: <T = unknown>(url: string, data?: unknown, config?: object) =>
    apiClient.put<T>(url, data, config),
  patch: <T = unknown>(url: string, data?: unknown, config?: object) =>
    apiClient.patch<T>(url, data, config),
  delete: <T = unknown>(url: string, config?: object) =>
    apiClient.delete<T>(url, config),
};

// Export the apiClient for direct usage
export { apiClient };
