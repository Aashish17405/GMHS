/**
 * PWA Cache Management Utility
 *
 * This utility provides enhanced cache management for the PWA to ensure
 * API data is never cached while maintaining offline functionality for static assets.
 */

interface PWACacheOptions {
  clearApiCache?: boolean;
  clearAllCaches?: boolean;
  updateServiceWorker?: boolean;
}

class PWACacheManager {
  private static instance: PWACacheManager;

  private constructor() {}

  static getInstance(): PWACacheManager {
    if (!PWACacheManager.instance) {
      PWACacheManager.instance = new PWACacheManager();
    }
    return PWACacheManager.instance;
  }

  /**
   * Clear all API-related caches through service worker
   */
  async clearApiCaches(): Promise<void> {
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CLEAR_API_CACHE",
        });
        console.log("🗑️ PWA: API cache clearing requested");
      }

      // Also clear any browser caches for API endpoints
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        const apiCaches = cacheNames.filter(
          (name) =>
            name.includes("api") ||
            name.includes("data") ||
            name.includes("json")
        );

        await Promise.all(
          apiCaches.map((cacheName) => {
            console.log("🗑️ PWA: Clearing cache:", cacheName);
            return caches.delete(cacheName);
          })
        );
      }
    } catch (error) {
      console.error("❌ PWA: Failed to clear API caches:", error);
    }
  }

  /**
   * Force refresh of service worker to get latest no-cache implementation
   */
  async updateServiceWorker(): Promise<void> {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          console.log("🔄 PWA: Service worker updated");
        }
      }
    } catch (error) {
      console.error("❌ PWA: Failed to update service worker:", error);
    }
  }

  /**
   * Comprehensive cache management for PWA
   */
  async manageCaches(options: PWACacheOptions = {}): Promise<void> {
    const {
      clearApiCache = true,
      clearAllCaches = false,
      updateServiceWorker = true,
    } = options;

    try {
      if (updateServiceWorker) {
        await this.updateServiceWorker();
      }

      if (clearApiCache) {
        await this.clearApiCaches();
      }

      if (clearAllCaches && "caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => {
            console.log("🗑️ PWA: Clearing all cache:", cacheName);
            return caches.delete(cacheName);
          })
        );
      }

      console.log("✅ PWA: Cache management completed");
    } catch (error) {
      console.error("❌ PWA: Cache management failed:", error);
    }
  }

  /**
   * Check if the app is running as PWA
   */
  isPWA(): boolean {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://")
    );
  }

  /**
   * Get cache statistics for debugging
   */
  async getCacheStats(): Promise<{
    totalCaches?: number;
    cacheNames?: string[];
    apiCaches?: string[];
    staticCaches?: string[];
    error?: string;
  }> {
    if (!("caches" in window)) {
      return { error: "Cache API not supported" };
    }

    try {
      const cacheNames = await caches.keys();
      const stats = {
        totalCaches: cacheNames.length,
        cacheNames: cacheNames,
        apiCaches: cacheNames.filter(
          (name) =>
            name.includes("api") ||
            name.includes("data") ||
            name.includes("json")
        ),
        staticCaches: cacheNames.filter(
          (name) =>
            !name.includes("api") &&
            !name.includes("data") &&
            !name.includes("json")
        ),
      };

      console.log("📊 PWA Cache Stats:", stats);
      return stats;
    } catch (error) {
      console.error("❌ PWA: Failed to get cache stats:", error);
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Initialize PWA cache management
   */
  async initialize(): Promise<void> {
    try {
      console.log("🚀 PWA Cache Manager initialized");

      // Clear any existing API caches on startup
      await this.clearApiCaches();

      // Set up periodic cache maintenance (every 30 minutes)
      setInterval(() => {
        this.clearApiCaches();
      }, 30 * 60 * 1000);

      // Listen for online/offline events to manage caches
      window.addEventListener("online", () => {
        console.log("🌐 PWA: Back online - clearing API caches");
        this.clearApiCaches();
      });

      window.addEventListener("beforeunload", () => {
        // Clear API caches before page unload to ensure fresh start
        this.clearApiCaches();
      });
    } catch (error) {
      console.error("❌ PWA: Failed to initialize cache manager:", error);
    }
  }
}

// Export singleton instance
export const pwaCacheManager = PWACacheManager.getInstance();

// Auto-initialize if in browser environment
if (typeof window !== "undefined") {
  pwaCacheManager.initialize();
}

export default PWACacheManager;
