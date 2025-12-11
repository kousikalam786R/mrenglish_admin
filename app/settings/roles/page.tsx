"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Edit, Trash2, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
} from "@/lib/api/settings";
import {
  setRoles,
  addRole,
  updateRole as updateRoleAction,
  removeRole,
  setLoading,
} from "@/redux/slices/settingsSlice";
import { Role } from "@/lib/types/settings";
import { RolePermissions } from "@/lib/permissions";
import { ConfirmDangerAction } from "@/components/settings/ConfirmDangerAction";

export default function RolesSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const settings = useAppSelector((state) => state.settings);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  useEffect(() => {
    if (!checkAccess(user.role, "settings")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "settings")) {
      loadRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadRoles = async () => {
    try {
      dispatch(setLoading(true));
      const roles = await fetchRoles();
      dispatch(setRoles(roles));
    } catch (error) {
      console.error("Error loading roles:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCreate = async () => {
    if (!roleName.trim()) {
      alert("Role name is required");
      return;
    }

    try {
      const newRole = await createRole({
        name: roleName.trim(),
        description: roleDescription.trim() || undefined,
        permissions: selectedPermissions,
        isSystem: false,
      });
      dispatch(addRole(newRole));
      setShowCreate(false);
      resetForm();
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingRole || !roleName.trim()) {
      return;
    }

    try {
      const updated = await updateRole(editingRole._id, {
        name: roleName.trim(),
        description: roleDescription.trim() || undefined,
        permissions: selectedPermissions,
      });
      dispatch(updateRoleAction(updated));
      setEditingRole(null);
      resetForm();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete._id);
      dispatch(removeRole(roleToDelete._id));
      setDeleteConfirmOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("Cannot delete system role or role with assigned users");
    }
  };

  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
  };

  const canCreate = user.role === "super_admin";
  const canDelete = user.role === "super_admin";

  // Get all available permissions from RolePermissions
  const allPermissions = Array.from(
    new Set(Object.values(RolePermissions).flat())
  );

  if (!checkAccess(user.role, "settings")) {
    return null;
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Roles & Permissions</h1>
            <p className="text-muted-foreground">Manage roles and their permissions</p>
          </div>
          {canCreate && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          )}
        </div>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>{settings.roles.length} role(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No roles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    settings.roles.map((role) => (
                      <TableRow key={role._id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {role.permissions.slice(0, 3).map((p) => (
                              <Badge key={p} variant="outline" className="text-xs">
                                {p}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {role.userCount || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={role.isSystem ? "default" : "secondary"}>
                            {role.isSystem ? "System" : "Custom"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingRole(role);
                                setRoleName(role.name);
                                setRoleDescription(role.description || "");
                                setSelectedPermissions(role.permissions);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {canDelete && !role.isSystem && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setRoleToDelete(role);
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog
          open={showCreate || editingRole !== null}
          onOpenChange={(open) => {
            if (!open) {
              setShowCreate(false);
              setEditingRole(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
              <DialogDescription>
                {editingRole ? "Update role details and permissions" : "Create a new custom role"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name *</Label>
                <Input
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Role name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Input
                  id="roleDescription"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Role description"
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {allPermissions.map((permission) => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, permission]);
                            } else {
                              setSelectedPermissions(
                                selectedPermissions.filter((p) => p !== permission)
                              );
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreate(false);
                    setEditingRole(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingRole ? handleUpdate : handleCreate}>
                  {editingRole ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        {roleToDelete && (
          <ConfirmDangerAction
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            title="Delete Role"
            description={`Are you sure you want to delete the role "${roleToDelete.name}"? This action cannot be undone.`}
            resourceName={roleToDelete.name}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </SettingsLayout>
  );
}

