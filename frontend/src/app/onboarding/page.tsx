"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, AlertCircle, Lock, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Character, CharacterCreatePayload } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CosmeticFrame } from "@/components/rpg/CosmeticFrame";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export default function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("Novice Adventurer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { session, loading: authLoading, isAuthenticated } = useAuth();

  // If user is already authenticated and has a character, redirect straight to dashboard
  const { data: character } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (character) {
      router.push("/dashboard");
    }
  }, [character, router]);

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !session?.access_token) {
      setError("Active authenticated session required. Please sign in first.");
      return;
    }

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

  // Loading state while checking authentication session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500/30">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
            Attuning to Adventurer Leyline...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated gate: prevents unauthenticated character creation requests
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500/30">
        <div className="w-full max-w-md">
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl text-center">
            <CardHeader className="space-y-2 pb-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-display text-slate-100">
                Authentication Required
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                You must be signed in to perform the Character Creation Ritual.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-3 pb-6">
              <p>
                If you just created an account and email verification is enabled, please verify your email before entering the realm.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 border-t border-slate-800 pt-4">
              <Link href="/login" className="w-full">
                <Button variant="gold" className="w-full gap-2">
                  Sign In to Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup" className="w-full">
                <Button variant="outline" className="w-full text-xs">
                  Create an Account
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500/30">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          {/* Live Character Avatar Preview */}
          <div className="mb-4">
            <CosmeticFrame
              size="lg"
              username={username || "A"}
              frameKey="default_frame"
              badgeKey="novice_badge"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-slate-100 uppercase text-center font-display">
            Forge Your Hero
          </h1>
          <p className="text-xs text-slate-400 tracking-wider uppercase font-medium mt-1">
            Character Creation Ritual
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
          <CardHeader>
            <CardTitle className="font-display text-lg">Name Your Adventurer</CardTitle>
            <CardDescription>
              Choose the identity under which all your real-world achievements will be recorded.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleOnboarding}>
            <CardContent className="space-y-4">
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-2 p-3 rounded-md bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="onboarding-username" className="text-xs font-semibold text-slate-300">
                  Adventurer Name
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="onboarding-username"
                    placeholder="e.g. Eldrin Stoneguard"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={2}
                    maxLength={50}
                    className="pl-9"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500">2-50 characters. Plain text only.</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="onboarding-title" className="text-xs font-semibold text-slate-300">
                  Starting Title
                </label>
                <Input
                  id="onboarding-title"
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
