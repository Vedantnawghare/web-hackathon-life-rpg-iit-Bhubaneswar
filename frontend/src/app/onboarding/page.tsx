"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Character, CharacterCreatePayload } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("Novice Adventurer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const payload: CharacterCreatePayload = {
      username: username.trim(),
      title: title.trim(),
      timezone: userTimezone,
    };

    try {
      await apiClient<Character>("/characters/me/onboarding", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to initialize character. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500/30">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-slate-100 uppercase text-center">
            Forge Your Hero
          </h1>
          <p className="text-xs text-slate-400 tracking-wider uppercase font-medium mt-1">
            Character Creation Ritual
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
          <CardHeader>
            <CardTitle>Name Your Adventurer</CardTitle>
            <CardDescription>
              Choose the identity under which all your real-world achievements will be recorded.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleOnboarding}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Adventurer Name</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="e.g. Eldrin Stoneguard"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={2}
                    maxLength={50}
                    className="pl-9"
                  />
                </div>
                <p className="text-[11px] text-slate-500">2-50 characters. Plain text only.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Starting Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" variant="gold" className="w-full gap-2" disabled={loading}>
                {loading ? "Awakening..." : "Begin Your Journey"} <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
