"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface ConfirmDangerActionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  resourceName: string;
  onConfirm: () => void;
  confirmText?: string;
}

export function ConfirmDangerAction({
  open,
  onOpenChange,
  title,
  description,
  resourceName,
  onConfirm,
  confirmText = "Type the resource name to confirm",
}: ConfirmDangerActionProps) {
  const [typedName, setTypedName] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (typedName !== resourceName) {
      setError("Resource name does not match");
      return;
    }
    onConfirm();
    setTypedName("");
    setError("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setTypedName("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="confirmName">
              {confirmText}: <span className="font-mono font-semibold">{resourceName}</span>
            </Label>
            <Input
              id="confirmName"
              value={typedName}
              onChange={(e) => {
                setTypedName(e.target.value);
                setError("");
              }}
              placeholder={resourceName}
              className="mt-2"
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={typedName !== resourceName}>
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

