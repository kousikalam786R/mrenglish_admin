"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Institute, InstituteFormData } from "@/lib/types/institute";

interface InstituteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Institute | null;
  onSubmit: (data: InstituteFormData) => Promise<void>;
  title: string;
  description: string;
}

export function InstituteFormModal({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  title,
  description,
}: InstituteFormModalProps) {
  const [name, setName] = React.useState(initialData?.name ?? "");
  const [email, setEmail] = React.useState(initialData?.email ?? "");
  const [address, setAddress] = React.useState(initialData?.address ?? "");
  const [phone, setPhone] = React.useState(initialData?.phone ?? "");
  const [password, setPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setEmail(initialData?.email ?? "");
      setAddress(initialData?.address ?? "");
      setPhone(initialData?.phone ?? "");
      setPassword("");
      setError("");
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!initialData && !password.trim()) {
      setError("Password is required for new institute.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        ...(!initialData && password ? { password: password } : {}),
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save institute.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="inst-name">Institute Name *</Label>
            <Input
              id="inst-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Institute name"
              required
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inst-email">Email *</Label>
            <Input
              id="inst-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@institute.com"
              required
              disabled={saving}
            />
          </div>
          {!initialData && (
            <div className="space-y-2">
              <Label htmlFor="inst-password">Password *</Label>
              <Input
                id="inst-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Login password"
                required={!initialData}
                disabled={saving}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="inst-address">Address</Label>
            <Input
              id="inst-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inst-phone">Phone</Label>
            <Input
              id="inst-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              disabled={saving}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
