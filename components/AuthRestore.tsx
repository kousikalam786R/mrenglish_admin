"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUser, setPermissions } from "@/redux/slices/userSlice";
import { RolePermissions } from "@/lib/permissions";
import axiosInstance from "@/lib/axiosInstance";
import { AdminRole } from "@/lib/types";

export function AuthRestore() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  useEffect(() => {
    // Only restore if not already authenticated
    if (isAuthenticated) return;

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    // Try to verify token and get user info
    const verifyToken = async () => {
      try {
        const response = await axiosInstance.get("/auth/me");
        
        if (response.data && response.data.user) {
          const userData = response.data.user;
          
          // Check if we have a role in cookie (for admin role)
          // TODO: Add admin role to user model or get from API
          const roleCookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("admin_role="));
          const role = roleCookie?.split("=")[1] as AdminRole || "super_admin";

          // Set user from API response
          dispatch(
            setUser({
              name: userData.name || "Admin",
              role: role,
              email: userData.email || "",
            })
          );

          // Set permissions
          const permissions = RolePermissions[role] || [];
          dispatch(setPermissions(permissions));
        }
      } catch (error) {
        // Token invalid, clear it
        localStorage.removeItem("admin_token");
        document.cookie = "admin_role=; path=/; max-age=0";
        console.error("Token verification failed:", error);
      }
    };

    verifyToken();
  }, [dispatch, isAuthenticated]);

  return null;
}

