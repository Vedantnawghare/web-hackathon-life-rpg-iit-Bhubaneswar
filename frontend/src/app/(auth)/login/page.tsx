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
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 brightness-[1.08] contrast-[1.05] saturate-115"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e]/75 via-[#0b1338]/30 to-[#070b1e]/65 pointer-events-none z-0" />
      <div className="relative z-10 w-full max-w-md">

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center gap-2.5 mb-2 group">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500/25 to-amber-900/40 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform">
              <Flame className="h-6 w-6 fill-amber-400/30 text-amber-300 animate-pulse" />
            </div>
            <span className="font-black text-2xl tracking-widest text-amber-50 uppercase font-display drop-shadow-[0_0_15px_rgba(245,158,11,0.35)]">
              Life RPG
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/70 border border-amber-500/30 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            <p className="text-[11px] text-amber-200 tracking-widest uppercase font-mono font-semibold">
              Portal to Aethelgard • Welcome Back
            </p>
          </div>
        </div>

        <Card className="border-2 border-amber-500/40 bg-slate-900/85 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_25px_rgba(245,158,11,0.18)] rounded-2xl relative overflow-hidden">
          {/* Top Luminous Banner Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          <CardHeader className="space-y-1.5 pb-3">
            <CardTitle className="text-2xl font-bold font-display text-amber-50 tracking-wide drop-shadow-sm">
              Sign In to Your Hero
            </CardTitle>
            <CardDescription className="text-sm text-indigo-100/90 font-sans leading-relaxed">
              Enter your credentials to resume your campaign and defend the realm
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs font-medium shadow-md"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-xs font-bold text-slate-100 uppercase tracking-wider font-sans">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-400/80" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="hero@realm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-slate-950/80 border-slate-600/80 hover:border-amber-400/50 focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/40 text-white placeholder:text-slate-300/80 text-sm font-sans rounded-lg shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-password" className="text-xs font-bold text-slate-100 uppercase tracking-wider font-sans">
                  Secret Key / Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-400/80" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 bg-slate-950/80 border-slate-600/80 hover:border-amber-400/50 focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/40 text-white placeholder:text-slate-300/80 text-sm font-sans rounded-lg shadow-inner"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-1">
              <Button
                type="submit"
                variant="gold"
                className="w-full h-11 text-sm font-bold uppercase font-display tracking-wider gap-2 shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]"
                disabled={loading}
              >
                {loading ? "Authenticating Adventurer..." : "Enter the Realm"} <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="text-center text-xs text-slate-200 font-sans">
                Don&apos;t have an adventurer account?{" "}
                <Link href="/signup" className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-4 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] transition-colors">
                  Create Hero Account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
