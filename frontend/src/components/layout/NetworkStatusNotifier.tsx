"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function NetworkStatusNotifier() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    if (!window.navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none flex flex-col items-center gap-2"
    >
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto px-4 py-2 rounded-2xl bg-slate-950/95 border-2 border-rose-500/70 text-rose-200 text-xs font-mono font-bold flex items-center gap-2.5 shadow-[0_8px_30px_rgba(244,63,94,0.45)] backdrop-blur-xl"
            role="alert"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <WifiOff className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Connection to the Realm Lost &bull; Offline Mode Active</span>
          </motion.div>
        )}

        {showReconnected && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto px-4 py-2 rounded-2xl bg-slate-950/95 border-2 border-emerald-500/70 text-emerald-200 text-xs font-mono font-bold flex items-center gap-2.5 shadow-[0_8px_30px_rgba(16,185,129,0.45)] backdrop-blur-xl"
            role="status"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Connection Restored &bull; Synchronized with the Realm</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
