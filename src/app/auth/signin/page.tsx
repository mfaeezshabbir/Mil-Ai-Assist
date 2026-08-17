"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import SysLogo from "@/components/Logo";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        // Refresh session and redirect
        await getSession();
        router.push("/planner");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        devSkip: "1",
        redirect: false,
      });

      if (result?.error) {
        setError("Dev skip failed. Please check your credentials config.");
      } else {
        await getSession();
        router.push("/planner");
      }
    } catch {
      setError("An error occurred during skip.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-tactical-grid bg-[size:24px_24px] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SysLogo />
            <div className="text-left">
              <div className="text-lg font-display tracking-[0.22em] uppercase text-primary">
                MilAIAssist
              </div>
              <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                Theater CIC
              </div>
            </div>
          </div>
          <p className="text-[10px] font-mono tracking-[0.22em] text-secondary uppercase">
            Restricted access // exercise
          </p>
        </div>

        <Card className="hud-scan border-primary/35 bg-card/90 backdrop-blur-sm shadow-tactical">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-base tracking-[0.18em]">
              <Shield className="h-5 w-5" />
              Authenticate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="font-mono text-sm tracking-wide"
                >
                  USERNAME
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="font-mono"
                  placeholder="Enter username"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="font-mono text-sm tracking-wide"
                >
                  PASSWORD
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="font-mono"
                  placeholder="Enter password"
                />
              </div>

              {error && (
                <div className="text-destructive text-sm font-mono text-center border border-destructive/20 bg-destructive/10 rounded p-2">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-mono tracking-wide"
                >
                  {loading ? "AUTHENTICATING..." : "AUTHENTICATE"}
                </Button>

                {process.env.NODE_ENV === "development" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    disabled={loading}
                    className="w-full font-mono tracking-wide border-primary/20 text-primary/60 hover:text-primary"
                  >
                    SKIP AUTH (DEV ONLY)
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            RETURN TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
