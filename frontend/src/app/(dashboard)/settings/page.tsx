"use client";

import { Settings as SettingsIcon, Volume2, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUiStore } from "@/hooks/use-ui-store";

export default function SettingsPage() {
  const { isAudioMuted, toggleAudioMute, audioVolume, setAudioVolume } = useUiStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <SettingsIcon className="h-6 w-6 text-amber-400" /> Guild Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust client preferences, sound effects, and local interface options.
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Audio Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-amber-400" /> Audio & Sound Effects
            </CardTitle>
            <CardDescription>
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
                onClick={toggleAudioMute}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                  isAudioMuted
                    ? "bg-slate-800 text-slate-400"
                    : "bg-emerald-950 border border-emerald-500/40 text-emerald-300"
                }`}
              >
                {isAudioMuted ? "Muted" : "Active"}
              </button>
            </div>

            {!isAudioMuted && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Volume</span>
                  <span>{Math.round(audioVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security & Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
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
  );
}
