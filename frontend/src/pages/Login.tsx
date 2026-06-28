import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaverickWordmark } from "@/components/MaverickLogo";
import hexLogo from "@assets/hex-logo.png";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";
import { setSession, type AuthSession } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

type Role = "admin" | "candidate";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await apiPost<AuthSession>("/auth/login", { email, password });
      setSession(session);
      if (session.role === "candidate") {
        setLocation("/candidate");
      } else {
        setLocation("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials. Please try again.";
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isCandidate = role === "candidate";

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-sidebar text-sidebar-foreground p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        ></div>
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-sidebar-primary/20 to-transparent pointer-events-none"></div>

        <div className="relative z-10">
          <MaverickWordmark className="scale-125 origin-top-left" />
        </div>

        <motion.div
          key={role}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 max-w-lg"
        >
          {isCandidate ? (
            <>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Your training journey, on one screen.
              </h1>
              <p className="text-sidebar-foreground/70 text-lg">
                See your batch schedule, take assessments, share feedback, and
                track your progress through every milestone.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Command center for global training operations.
              </h1>
              <p className="text-sidebar-foreground/70 text-lg">
                Manage batches, track candidate performance, and optimize trainer
                utilization across the enterprise.
              </p>
            </>
          )}
        </motion.div>

        <div className="relative z-10 flex items-center gap-3">
          <span className="text-sm font-medium tracking-wide text-sidebar-foreground/60 uppercase">
            Demo credentials
          </span>
          <div className="text-sm text-sidebar-foreground/70 bg-sidebar-foreground/10 px-3 py-1.5 rounded-full border border-sidebar-foreground/20 font-mono">
            {isCandidate ? "kishlay.kumar@hexaware.com" : "admin@hexaware.com"} · Password@123
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 relative bg-card">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="lg:hidden flex justify-center mb-2">
            <MaverickWordmark />
          </div>

          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-muted">
            <button
              type="button"
              onClick={() => { setRole("admin"); setEmail(""); setPassword(""); }}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
                role === "admin"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Briefcase className="h-4 w-4" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => { setRole("candidate"); setEmail(""); setPassword(""); }}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
                role === "candidate"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GraduationCap className="h-4 w-4" />
              Candidate
            </button>
          </div>

          <motion.div
            key={role}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center md:text-left mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {isCandidate ? "Welcome, learner" : "Welcome back"}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                {isCandidate
                  ? "Sign in to access your training portal."
                  : "Enter your credentials to access the platform."}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@hexaware.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold shadow-md"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</>
                  ) : (
                    isCandidate ? "Enter portal" : "Sign In"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground pt-1">
                  {isCandidate
                    ? "Demo: kishlay.kumar@hexaware.com · Password@123"
                    : "Demo: admin@hexaware.com · Password@123"}
                </p>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2 opacity-60">
          <span className="text-sm font-medium text-muted-foreground">
            Powered by
          </span>
          <img
            src={hexLogo}
            alt="Hexaware"
            className="h-6 object-contain grayscale"
          />
        </div>
      </div>
    </div>
  );
}
