"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GAME_ASSETS } from "@/lib/game-assets";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Case 1: Session immediately returned (Email confirmation disabled / auto-confirmed)
      if (data.session) {
        router.push("/onboarding");
        return;
      }

      // Case 2: Email confirmation required (session is null until verified)
      if (data.user) {
        setVerificationSentTo(email);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.");
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
              New Hero Registration • Begin Your Legend
            </p>
          </div>
        </div>

        {verificationSentTo ? (
          <Card className="border-2 border-amber-500/40 bg-slate-900/85 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_25px_rgba(245,158,11,0.18)] rounded-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <CardHeader className="space-y-2 pb-4">
              <div className="mx-auto h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 mb-1 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold font-display text-amber-50">
                Check Your Adventurer Mail
              </CardTitle>
              <CardDescription className="text-sm text-indigo-100/90 font-sans">
                A magical verification link has been dispatched to:
              </CardDescription>
              <p className="text-sm font-semibold font-mono text-amber-300 break-all px-2 py-1 rounded bg-slate-950/70 border border-amber-500/30 w-fit mx-auto">
                {verificationSentTo}
              </p>
            </CardHeader>
            <CardContent className="text-xs text-slate-200 space-y-3 pb-6 leading-relaxed">
              <p>
                Click the confirmation link in your email to verify your adventurer account. Once confirmed, sign in to forge your character and begin your campaign.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 border-t border-slate-700/60 pt-4">
              <Link href="/login" className="w-full">
                <Button variant="gold" className="w-full h-11 text-sm font-bold uppercase font-display tracking-wider gap-2 shadow-[0_0_25px_rgba(245,158,11,0.45)]">
                  Proceed to Sign In <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                type="button"
                variant="ghost"
                className="text-xs text-slate-300 hover:text-white"
                onClick={() => setVerificationSentTo(null)}
              >
                Use a different email address
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-2 border-amber-500/40 bg-slate-900/85 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.85),0_0_25px_rgba(245,158,11,0.18)] rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <CardHeader className="space-y-1.5 pb-3">
              <CardTitle className="text-2xl font-bold font-display text-amber-50 tracking-wide drop-shadow-sm">
                Create Adventurer Profile
              </CardTitle>
              <CardDescription className="text-sm text-indigo-100/90 font-sans leading-relaxed">
                Register to synchronize your character, quests, and stats across devices
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSignup}>
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
                  <label htmlFor="signup-email" className="text-xs font-bold text-slate-100 uppercase tracking-wider font-sans">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-400/80" />
                    <Input
                      id="signup-email"
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
                  <label htmlFor="signup-password" className="text-xs font-bold text-slate-100 uppercase tracking-wider font-sans">
                    Secret Passcode (Min 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-400/80" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
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
                  {loading ? "Forging Account..." : "Create Character"} <ArrowRight className="h-4 w-4" />
                </Button>

                <div className="text-center text-xs text-slate-200 font-sans">
                  Already registered?{" "}
                  <Link href="/login" className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-4 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)] transition-colors">
                    Sign In
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
