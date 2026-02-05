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
import { Select } from "@/components/ui/select";
import { User } from "@/lib/types/user";

interface StudentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<User> | null;
  onSubmit: (data: { name: string; email: string; gender?: string; country?: string; phone?: string }) => Promise<void>;
  title: string;
  description: string;
}

export function StudentFormModal({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  title,
  description,
}: StudentFormModalProps) {
  const [name, setName] = React.useState(initialData?.name ?? "");
  const [email, setEmail] = React.useState(initialData?.email ?? "");
  const [gender, setGender] = React.useState(initialData?.gender ?? "");
  const [country, setCountry] = React.useState(initialData?.country ?? "");
  const [phone, setPhone] = React.useState(initialData?.phone ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setEmail(initialData?.email ?? "");
      setGender(initialData?.gender ?? "");
      setCountry(initialData?.country ?? "");
      setPhone(initialData?.phone ?? "");
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
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), gender: gender || undefined, country: country || undefined, phone: phone || undefined });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save student.");
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
            <Label htmlFor="student-name">Name *</Label>
            <Input
              id="student-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student name"
              required
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-email">Email *</Label>
            <Input
              id="student-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-gender">Gender</Label>
            <Select
              id="student-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={saving}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-country">Country</Label>
            <Input
              id="student-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-phone">Phone</Label>
            <Input
              id="student-phone"
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
