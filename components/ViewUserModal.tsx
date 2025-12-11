"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { User } from "@/lib/types/user";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ViewUserModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewUserModal({ user, open, onOpenChange }: ViewUserModalProps) {
  if (!user) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return "N/A";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View complete user information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {user.profilePicThumbnail ? (
                  <img
                    src={user.profilePicThumbnail}
                    alt={user.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {user.bio && (
                <div>
                  <p className="text-sm font-medium mb-1">Bio</p>
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Full Name</p>
                  <p className="text-sm text-muted-foreground">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Gender</p>
                  <p className="text-sm text-muted-foreground">
                    {user.gender || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Country</p>
                  <p className="text-sm text-muted-foreground">
                    {user.country || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {user.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Age</p>
                  <p className="text-sm text-muted-foreground">
                    {user.age || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscription Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Account Type</p>
                  {user.accountType === "Paid" ? (
                    <Badge variant="default">Paid</Badge>
                  ) : (
                    <Badge variant="outline">Free</Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {user.subscriptionType || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.subscriptionStart)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">End Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.subscriptionEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Payment Method</p>
                  <p className="text-sm text-muted-foreground">
                    {user.paymentMethod || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration & Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registration & Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Registration Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.registeredOn || user.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Last Login</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.lastLoginAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Activity logs will be displayed here</p>
                <p className="mt-2 text-xs">This is a placeholder for future implementation</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
