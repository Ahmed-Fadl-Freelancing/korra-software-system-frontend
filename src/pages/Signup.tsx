import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DepartmentName, JobTitleLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User, Briefcase, Building2 } from "lucide-react";

const JOB_TITLES: JobTitleLevel[] = [
  "Junior Engineer",
  "Senior Engineer",
  "Lead Engineer",
  "Section Head",
  "Department Manager",
  "General Manager",
  "Director",
  "Board Member",
];

const DEPARTMENTS: DepartmentName[] = ["Sales", "Tech Office"];

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    jobTitle: "" as JobTitleLevel | "",
    department: "" as DepartmentName | "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.jobTitle || !form.department) {
      setError("Please select a job title and department.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error, needsConfirmation } = await signUp(
      form.email,
      form.password,
      form.fullName,
      form.jobTitle as JobTitleLevel,
      form.department as DepartmentName
    );

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (needsConfirmation) {
      // Email verification ON — user must confirm before signing in.
      navigate("/login", { state: { signedUp: true } });
    } else {
      // Email verification OFF (bypassed) — tokens already set, go straight to app.
      navigate("/app");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 bg-white shadow-sm">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <User className="h-6 w-6 text-blue-800" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">Create your account</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Join Korra — fill in your details below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-medium text-slate-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Ahmed Fadl"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* Job Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Job Title</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <Select
                  value={form.jobTitle}
                  onValueChange={(v) => update("jobTitle", v)}
                  required
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="Select your job title" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TITLES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Department</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
                <Select
                  value={form.department}
                  onValueChange={(v) => update("department", v)}
                  required
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@company.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pl-9"
                  minLength={8}
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="Re-enter your password"
                  className={`pl-9 ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? "border-red-400 focus-visible:ring-red-400"
                      : ""
                  }`}
                  required
                />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || (!!form.confirmPassword && form.password !== form.confirmPassword)}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white"
            >
              {loading ? "Creating account…" : "Create Account"}
            </Button>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-800 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
