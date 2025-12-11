"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createTicket } from "@/lib/api/tickets";
import { TicketPriority, TicketType } from "@/lib/types/ticket";
import { fetchUsers } from "@/lib/api/users";
import { User } from "@/lib/types/user";

export default function CreateTicketPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<TicketType>("General");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Permission enforcement
  if (!checkAccess(user.role, "tickets")) {
    router.push("/dashboard");
    return null;
  }

  const canCreate = user.role === "super_admin" || user.role === "support_manager" || user.role === "admin";
  if (!canCreate) {
    router.push("/tickets");
    return null;
  }

  // Load users for search
  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await fetchUsers({}, { page: 1, limit: 50, total: 0, totalPages: 0 });
      setUsers(result.users);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    setUserId(selectedUser._id);
    setUserName(selectedUser.name);
    setUserEmail(selectedUser.email);
    setSearchQuery("");
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!userId) {
      newErrors.user = "User is required";
    }
    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setCreating(true);
      const newTicket = await createTicket({
        userId,
        userName,
        userEmail,
        subject: subject.trim(),
        type,
        priority,
        description: description.trim(),
        status: "Open",
      });
      router.push(`/tickets/${newTicket._id}`);
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/tickets")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Ticket</h1>
          <p className="text-muted-foreground">
            Create a new support ticket on behalf of a user
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Details</CardTitle>
          <CardDescription>
            Fill in the information to create a new ticket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div className="space-y-2">
              <Label htmlFor="user">User *</Label>
              <div className="relative">
                <Input
                  id="user"
                  placeholder="Search user by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value && users.length === 0) {
                      loadUsers();
                    }
                  }}
                  onFocus={loadUsers}
                />
                {searchQuery && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredUsers.map((u) => (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleUserSelect(u)}
                        className="w-full text-left px-4 py-2 hover:bg-muted"
                      >
                        <div className="font-medium">{u.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {u.email}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {userId && (
                <div className="p-2 bg-muted rounded-md">
                  <span className="text-sm">
                    Selected: {userName} ({userEmail})
                  </span>
                </div>
              )}
              {errors.user && (
                <p className="text-sm text-destructive">{errors.user}</p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue"
                disabled={creating}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject}</p>
              )}
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as TicketType)}
                  disabled={creating}
                >
                  <option value="Bug">Bug</option>
                  <option value="Payment">Payment</option>
                  <option value="Content">Content</option>
                  <option value="General">General</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  id="priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as TicketPriority)
                  }
                  disabled={creating}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the issue..."
                disabled={creating}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Attachments Placeholder */}
            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <div className="border-2 border-dashed rounded-md p-4 text-center text-muted-foreground">
                <p>File upload functionality will be implemented here</p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/tickets")}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

