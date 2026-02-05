"use client";

import { useAppSelector } from "@/redux/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { clearUser } from "@/redux/slices/userSlice";

export function Navbar() {
  const user = useAppSelector((state) => state.user);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_institute_id");
      document.cookie = "admin_role=; path=/; max-age=0";
    }
    dispatch(clearUser());
    router.push("/login");
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === "super_admin") return "destructive";
    if (role === "admin") return "default";
    if (role === "institute") return "outline";
    return "secondary";
  };

  const formatRole = (role: string) => {
    return role.replace(/_/g, " ").toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 lg:ml-64">
      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">{user.name}</span>
            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
              {formatRole(user.role)}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

