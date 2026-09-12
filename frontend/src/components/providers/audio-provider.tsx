"use client";

import { useEffect, useRef } from "react";
import { audioManager } from "@/lib/audio-manager";
import { useUiStore } from "@/hooks/use-ui-store";

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { isAudioMuted, audioVolume } = useUiStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Load stored mute preference
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

  useEffect(() => {
    audioManager.setMuted(isAudioMuted);
    if (typeof window !== "undefined") {
      localStorage.setItem("liferpg_audio_muted", String(isAudioMuted));
    }
  }, [isAudioMuted]);

  useEffect(() => {
    audioManager.setVolume(audioVolume);
  }, [audioVolume]);

  useEffect(() => {
    if (hasInitialized.current) return;

    const startContinuousBgm = () => {
      audioManager.unlockContext();
      audioManager.startAmbientMusic();
      hasInitialized.current = true;
      window.removeEventListener("pointerdown", startContinuousBgm);
      window.removeEventListener("keydown", startContinuousBgm);
      window.removeEventListener("click", startContinuousBgm);
    };

    window.addEventListener("pointerdown", startContinuousBgm, { once: true });
    window.addEventListener("keydown", startContinuousBgm, { once: true });
    window.addEventListener("click", startContinuousBgm, { once: true });

    return () => {
      window.removeEventListener("pointerdown", startContinuousBgm);
      window.removeEventListener("keydown", startContinuousBgm);
      window.removeEventListener("click", startContinuousBgm);
    };
  }, []);

  return <>{children}</>;
}
