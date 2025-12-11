"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { setPermissions } from "@/redux/slices/userSlice";
import { RolePermissions } from "@/lib/permissions";

export function PermissionInitializer() {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Set permissions based on user role when role changes
    if (user.role) {
      const permissions = RolePermissions[user.role] || [];
      dispatch(setPermissions(permissions));
    }
  }, [user.role, dispatch]);

  return null; // This component doesn't render anything
}

