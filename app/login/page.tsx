"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUser, setPermissions } from "@/redux/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosInstance";
import { RolePermissions } from "@/lib/permissions";
import { Loader2, AlertCircle } from "lucide-react";
import { AdminRole } from "@/lib/types";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        // Store token
        localStorage.setItem("admin_token", response.data.token);

        // Use role from backend if valid, otherwise default to super_admin
        const validRoles: AdminRole[] = [
          "super_admin", "admin", "institute",
          "support_manager", "support_agent", "content_manager",
          "finance_manager", "marketing_manager", "analytics_manager", "developer"
        ];
        const backendRole = response.data.user?.role;
        const adminRole: AdminRole = validRoles.includes(backendRole) ? backendRole : "super_admin";
        const instituteId = response.data.user?.instituteId ?? undefined;

        // Set user in Redux
        dispatch(
          setUser({
            name: response.data.user.name,
            role: adminRole,
            email: response.data.user.email,
            instituteId,
          })
        );

        // Set permissions
        const permissions = RolePermissions[adminRole] || [];
        dispatch(setPermissions(permissions));

        // Set cookie for middleware
        document.cookie = `admin_role=${adminRole}; path=/; max-age=2592000`; // 30 days
        if (adminRole === "institute" && instituteId) {
          localStorage.setItem("admin_institute_id", instituteId);
        } else {
          localStorage.removeItem("admin_institute_id");
        }

        // Redirect: institute users go to students by default
        if (adminRole === "institute") {
          router.push("/students");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoInstituteLogin = () => {
    setError("");
    const demoToken = "demo_institute_token";
    localStorage.setItem("admin_token", demoToken);
    document.cookie = "admin_role=institute; path=/; max-age=2592000";
    localStorage.setItem("admin_institute_id", "inst1");
    dispatch(
      setUser({
        name: "ABC English Academy",
        role: "institute",
        email: "institute@mrenglish.com",
        instituteId: "inst1",
      })
    );
    dispatch(setPermissions(RolePermissions.institute || []));
    router.push("/students");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="SpeakVerse Logo" 
              width={200} 
              height={200}
              className="h-48 w-48 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            SpeakVerse Admin
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="relative my-4">
              <span className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </span>
              <span className="relative flex justify-center text-xs uppercase text-muted-foreground">
                Or
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoInstituteLogin}
              disabled={loading}
            >
              Demo: Sign in as Institute
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
            <p>Use your admin credentials to access the panel</p>
            <p className="text-xs">
              Institute login: <strong>institute@mrenglish.com</strong> / <strong>Institute123</strong> (run backend seed first)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

