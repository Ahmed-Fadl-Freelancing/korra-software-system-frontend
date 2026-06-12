import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Lock, Mail, CheckCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Show banner when arriving from successful signup
  const [signupSuccess] = useState(() => !!(location.state as any)?.signedUp);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const authError = await signIn(email, password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // DepartmentRedirect at /app handles routing to /app/sales or /app/tech
    navigate("/app");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm border-slate-200 bg-white shadow-sm">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <Layers className="h-6 w-6 text-blue-800" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">Welcome back</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Sales &amp; Tech Office Platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {signupSuccess && (
            <div className="flex items-start gap-2 rounded-md bg-green-50 border border-green-100 px-3 py-2 text-sm text-green-700">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Account created — check your email to confirm, then sign in.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-slate-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white"
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>

            <p className="text-center text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-blue-800 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
