"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { audioManager } from "@/lib/audio-manager";
import { useUiStore } from "@/hooks/use-ui-store";
import { Volume2, VolumeX } from "lucide-react";

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { isAudioMuted, audioVolume, toggleAudioMute } = useUiStore();
  const hasStartedAudioRef = useRef(false);
  const [isClient, setIsClient] = useState(false);

  // Load stored mute preference on mount
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const storedMute = localStorage.getItem("liferpg_audio_muted");
      if (storedMute !== null) {
        const muted = storedMute === "true";
        audioManager.setMuted(muted);
        if (muted !== useUiStore.getState().isAudioMuted) {
          useUiStore.setState({ isAudioMuted: muted });
        }
      }
    }
  }, []);

  // Sync mute state with audioManager and localStorage
  useEffect(() => {
    audioManager.setMuted(isAudioMuted);
    if (typeof window !== "undefined") {
      localStorage.setItem("liferpg_audio_muted", String(isAudioMuted));
    }
  }, [isAudioMuted]);

  // Sync volume with audioManager
  useEffect(() => {
    audioManager.setVolume(audioVolume);
  }, [audioVolume]);

  // Global unlock and start exploration music on first user interaction anywhere
  const triggerAudioStart = useCallback(() => {
    audioManager.unlockContext();
    if (!hasStartedAudioRef.current) {
      hasStartedAudioRef.current = true;
      audioManager.startAmbientMusic();
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFirstInteraction = () => {
      triggerAudioStart();
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { passive: true });
    window.addEventListener("keydown", handleFirstInteraction, { passive: true });
    window.addEventListener("click", handleFirstInteraction, { passive: true });
    window.addEventListener("touchstart", handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [triggerAudioStart]);

  const handleToggleSound = () => {
    triggerAudioStart();
    toggleAudioMute();
  };

  return (
    <>
      {children}

      {/* Global Floating Sound Control (Available across Login, Signup, and all game pages) */}
      {isClient && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 select-none pointer-events-auto">
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={isAudioMuted ? "Unmute Game Audio" : "Mute Game Audio"}
            className="group px-3 py-1.5 rounded-full bg-slate-950/90 hover:bg-slate-900 border-2 border-amber-500/60 hover:border-amber-400 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-2 text-xs font-cinzel font-bold text-amber-300 hover:scale-105 transition-all cursor-pointer"
          >
            {isAudioMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-rajdhani text-[11px] font-bold text-rose-300 tracking-wider">
                  MUTED
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                <span className="font-rajdhani text-[11px] font-bold text-emerald-300 tracking-wider">
                  SOUND ON
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
