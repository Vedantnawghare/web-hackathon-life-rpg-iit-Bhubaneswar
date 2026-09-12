"use client";

/* eslint-disable @next/next/no-img-element */
import { GAME_ASSETS } from "@/lib/game-assets";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { apiClient, ApiError } from "@/lib/api-client";
import { Character } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Check if user already initialized their character
      try {
        await apiClient<Character>("/characters/me");
        router.push("/dashboard");
      } catch (err) {
        if (err instanceof ApiError && err.code === "CHARACTER_NOT_FOUND") {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 selection:bg-amber-500/30 overflow-hidden">
      {/* Real Fantasy Realm Gateway Portal Background */}
      <img
        src={GAME_ASSETS.backgrounds.login}
        alt="Realm of Aethelgard Gateway"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 brightness-[1.04] contrast-[1.05] saturate-110 contrast-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1130]/55 via-[#0e163d]/20 to-[#0b1130]/35 pointer-events-none z-0" />
      <div className="relative z-10 w-full max-w-md">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="h-6 w-6 fill-amber-400/20" />
            </div>
            <span className="font-bold text-xl tracking-wider text-slate-100 uppercase font-display">
              Life RPG
            </span>
          </Link>
          <p className="text-xs text-slate-400 tracking-wider uppercase font-medium">
            Welcome Back, Adventurer
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-display">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to resume your campaign
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
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
                <label htmlFor="login-email" className="text-xs font-semibold text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="hero@realm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" variant="gold" className="w-full gap-2" disabled={loading}>
                {loading ? "Authenticating..." : "Enter the Realm"} <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="text-center text-xs text-slate-400">
                Don&apos;t have an adventurer account?{" "}
                <Link href="/signup" className="text-amber-400 hover:underline font-semibold">
                  Create One
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
