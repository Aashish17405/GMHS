"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPromptProps {
  onClose?: () => void;
  manualTrigger?: boolean; // For manual install button
  className?: string;
}

export default function InstallPrompt({ 
  onClose, 
  manualTrigger = false,
  className = ""
}: InstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Check if prompt should be shown (once per day)
  const shouldShowPrompt = () => {
    const lastShown = localStorage.getItem('pwa-prompt-last-shown');
    const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
    
    if (!lastShown && !lastDismissed) return true; // First time
    
    if (lastDismissed) {
      const dismissedDate = new Date(lastDismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceDismissed >= 1; // Show again after 1 day
    }
    
    if (lastShown) {
      const shownDate = new Date(lastShown);
      const daysSinceShown = (Date.now() - shownDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceShown >= 1; // Show again after 1 day
    }
    
    return false;
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Only show automatic prompt if it's been a day and not manually triggered
      if (!manualTrigger && shouldShowPrompt()) {
        setTimeout(() => {
          setIsVisible(true);
          localStorage.setItem('pwa-prompt-last-shown', new Date().toISOString());
        }, 5000); // Show after 5 seconds
      }
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setIsVisible(false);
      setIsInstallable(false);
      setDeferredPrompt(null);
      // Clear the localStorage items since app is now installed
      localStorage.removeItem('pwa-prompt-last-shown');
      localStorage.removeItem('pwa-prompt-dismissed');
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if app is already installed
    if (
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setIsInstallable(false);
    }

    // For manual trigger, show immediately if installable
    if (manualTrigger && isInstallable && deferredPrompt) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [manualTrigger, isInstallable, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
      localStorage.removeItem('pwa-prompt-dismissed');
    } else {
      console.log("User dismissed the install prompt");
      localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
    }

    // Clear the deferredPrompt variable
    setDeferredPrompt(null);
    setIsVisible(false);
    onClose?.();
  };

  const handleClose = () => {
    setIsVisible(false);
    if (!manualTrigger) {
      localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
    }
    onClose?.();
  };

  // For manual trigger button, return a simple button
  if (manualTrigger) {
    if (!isInstallable || !deferredPrompt) {
      return null; // Don't show button if not installable
    }
    
    return (
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>
    );
  }

  if (!isVisible || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Install GMHS App</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Install our app for a better experience with offline access and quick
          loading.
        </p>

        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
