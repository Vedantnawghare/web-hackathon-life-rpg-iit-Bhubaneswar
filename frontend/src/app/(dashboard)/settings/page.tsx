"use client";

/* eslint-disable @next/next/no-img-element */
import { Settings as SettingsIcon, Volume2, Shield, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUiStore } from "@/hooks/use-ui-store";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Character } from "@/types/character";
import { GAME_ASSETS } from "@/lib/game-assets";

export default function SettingsPage() {
  const { isAudioMuted, toggleAudioMute, audioVolume, setAudioVolume } = useUiStore();

  const { data: character } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
  });

  const clientTimezone = typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";

  return (
    <>
      {/* Fixed Environment Backdrop: Preserves full artwork composition */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src={GAME_ASSETS.backgrounds.character}
          alt="Guild Sanctum Backdrop"
          className="w-full h-full object-cover object-center brightness-[1.04] contrast-[1.05] saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e]/75 via-[#0c1435]/45 to-[#070b1e]/85" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="border-b border-slate-800/80 pb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5 font-display">
            <SettingsIcon className="h-6 w-6 text-amber-400" /> Guild Settings
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            Adjust client preferences, sound effects, and realm interface options.
          </p>
        </div>

        <div className="space-y-4 max-w-2xl">
          {/* Audio Preferences */}
          <Card className="border-2 border-amber-500/30 bg-slate-900/85 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 font-display text-white">
                <Volume2 className="h-4 w-4 text-amber-400" /> Audio & Sound Effects
              </CardTitle>
              <CardDescription className="text-xs text-slate-300">
              Control celebratory SFX during quest completions, item purchases, and level-ups.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-slate-200 block">Sound Effects</span>
                <span className="text-xs text-slate-500">Enable or mute tactical audio feedback</span>
              </div>
              <button
                type="button"
                onClick={toggleAudioMute}
                aria-pressed={!isAudioMuted}
                aria-label={isAudioMuted ? "Unmute sound effects" : "Mute sound effects"}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  isAudioMuted
                    ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    : "bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900"
                }`}
              >
                {isAudioMuted ? "Muted" : "Active"}
              </button>
            </div>

            {!isAudioMuted && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs text-slate-400">
                  <label htmlFor="volume-slider" className="cursor-pointer">Volume</label>
                  <span className="font-mono">{Math.round(audioVolume * 100)}%</span>
                </div>
                <input
                  id="volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                  aria-label="Sound effects volume"
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Realm Timezone & Environment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 font-display">
              <Globe className="h-4 w-4 text-amber-400" /> Realm & Time Synchronization
            </CardTitle>
            <CardDescription>
              Timezone used for midnight recurring daily and weekly quest resets.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300">Local Realm Timezone</span>
              <span className="font-mono font-semibold text-amber-400">{clientTimezone}</span>
            </div>
            {character && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">Champion Identifier</span>
                <span className="font-mono text-slate-400">{character.username} ({character.id.slice(0, 8)}...)</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              Daily quests reset each midnight in your local timezone. Authoritative completion history is preserved in UTC across all realm cycles.
            </p>
          </CardContent>
        </Card>

        {/* Security & Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 font-display">
              <Shield className="h-4 w-4 text-amber-400" /> Security & Session
            </CardTitle>
            <CardDescription>
              Authentication is managed via Supabase Auth with server-authoritative token validation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-400 space-y-2">
            <p>
              Your session is cryptographically signed and scoped 1:1 to your authoritative character profile.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}
