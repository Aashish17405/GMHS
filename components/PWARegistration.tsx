"use client";

import { useEffect } from "react";
import InstallPrompt from "./InstallPrompt";

export default function PWARegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register(
            "/sw.js",
            {
              scope: "/",
            }
          );

          console.log("Service Worker registered successfully:", registration);

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker is available
                  console.log("New service worker available");

                  // Show update notification or prompt user
                  if (confirm("New version available! Reload to update?")) {
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Handle controller change
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            window.location.reload();
          });
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      };

      registerSW();

      // Enhanced cache management for PWA no-cache system
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      };

      // Clear API caches periodically to ensure fresh data
      const clearApiCaches = () => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "CLEAR_API_CACHE",
          });
          console.log("🗑️ Requested API cache clearing from PWA");
        }
      };

      // Check for updates every 30 minutes and clear API caches
      const updateInterval = setInterval(() => {
        checkForUpdates();
        clearApiCaches();
      }, 30 * 60 * 1000);

      // Clear API caches on initial load to ensure fresh start
      setTimeout(clearApiCaches, 5000);

      return () => {
        clearInterval(updateInterval);
      };
    }
  }, []);

  return (
    <>
      {/* Automatic install prompt with daily limit */}
      <InstallPrompt />
    </>
  );
}
