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
import { Edit, Mail, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchEmailTemplates,
  updateEmailTemplate,
  sendTestEmail,
} from "@/lib/api/settings";
import {
  setTemplates,
  updateTemplate,
  setLoading,
} from "@/redux/slices/settingsSlice";
import { EmailTemplate } from "@/lib/types/settings";
import { format } from "date-fns";

export default function EmailTemplatesSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const settings = useAppSelector((state) => state.settings);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "settings")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "settings")) {
      loadTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadTemplates = async () => {
    try {
      dispatch(setLoading(true));
      const templates = await fetchEmailTemplates();
      dispatch(setTemplates(templates));
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setSubject(template.subject);
    setBody(template.body);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    try {
      const updated = await updateEmailTemplate(editingTemplate._id, {
        subject,
        body,
      });
      dispatch(updateTemplate(updated));
      setEditingTemplate(null);
      setSubject("");
      setBody("");
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const handleSendTest = async () => {
    if (!editingTemplate || !testEmail.trim()) {
      alert("Please enter a test email address");
      return;
    }

    try {
      setSending(true);
      await sendTestEmail(editingTemplate._id, testEmail.trim());
      alert("Test email sent successfully");
    } catch (error) {
      console.error("Error sending test email:", error);
      alert("Error sending test email");
    } finally {
      setSending(false);
    }
  };

  const previewContent = (template: EmailTemplate) => {
    let preview = template.body;
    preview = preview.replace(/\{\{first_name\}\}/g, "John");
    preview = preview.replace(/\{\{company_name\}\}/g, "MR English");
    preview = preview.replace(/\{\{plan\}\}/g, "Premium");
    return preview;
  };

  if (!checkAccess(user.role, "settings")) {
    return null;
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Manage email message templates</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>{settings.templates.length} template(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Placeholders</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.templates.map((template) => (
                    <TableRow key={template._id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {template.placeholders.map((p) => (
                            <span key={p} className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {`{{${p}}}`}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(template.lastModified), "MMM dd, yyyy")}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          by {template.modifiedBy}
                        </span>
                      </TableCell>
                      <TableCell>v{template.version}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog
          open={editingTemplate !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingTemplate(null);
              setSubject("");
              setBody("");
              setTestEmail("");
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
              <DialogDescription>
                Update template content with placeholders
              </DialogDescription>
            </DialogHeader>
            {editingTemplate && (
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Body</Label>
                  <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Email body with {{placeholders}}"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available placeholders: {editingTemplate.placeholders.map((p) => `{{${p}}}`).join(", ")}
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-muted">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="space-y-2">
                    <p className="font-semibold">{subject.replace(/\{\{.*?\}\}/g, "Sample")}</p>
                    <p className="text-sm whitespace-pre-wrap">{previewContent({ ...editingTemplate, subject, body })}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Send Test Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="testEmail"
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@example.com"
                    />
                    <Button
                      variant="outline"
                      onClick={handleSendTest}
                      disabled={sending || !testEmail.trim()}
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Test
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingTemplate(null);
                      setSubject("");
                      setBody("");
                      setTestEmail("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SettingsLayout>
  );
}

