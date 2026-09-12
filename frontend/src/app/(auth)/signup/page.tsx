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
            Begin Your Legend
          </p>
        </div>

        {verificationSentTo ? (
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl text-center">
            <CardHeader className="space-y-2 pb-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-display text-slate-100">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-xs text-slate-300">
                A verification link has been dispatched to:
              </CardDescription>
              <p className="text-sm font-semibold font-mono text-amber-300 break-all">
                {verificationSentTo}
              </p>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-3 pb-6">
              <p>
                Click the confirmation link in your email to verify your adventurer account. Once confirmed, sign in to forge your character and begin your campaign.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 border-t border-slate-800 pt-4">
              <Link href="/login" className="w-full">
                <Button variant="gold" className="w-full gap-2">
                  Proceed to Sign In <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                type="button"
                variant="ghost"
                className="text-xs text-slate-400 hover:text-slate-200"
                onClick={() => setVerificationSentTo(null)}
              >
                Use a different email address
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-display">Create Adventurer Profile</CardTitle>
            <CardDescription>
              Register to synchronize your character, quests, and stats across devices
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSignup}>
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
                <label htmlFor="signup-email" className="text-xs font-semibold text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signup-email"
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
                <label htmlFor="signup-password" className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" variant="gold" className="w-full gap-2" disabled={loading}>
                {loading ? "Forging Account..." : "Create Character"} <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="text-center text-xs text-slate-400">
                Already registered?{" "}
                <Link href="/login" className="text-amber-400 hover:underline font-semibold">
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
