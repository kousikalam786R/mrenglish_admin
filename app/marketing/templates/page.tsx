"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchTemplates, createTemplate } from "@/lib/api/marketing";
import { setTemplates, addTemplate } from "@/redux/slices/marketingSlice";
import { Template, TemplateType } from "@/lib/types/marketing";

export default function TemplatesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const marketing = useAppSelector((state) => state.marketing);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<TemplateType>("Push");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "marketing")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "marketing")) {
      loadTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadTemplates = async () => {
    try {
      const templates = await fetchTemplates();
      dispatch(setTemplates(templates));
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !content.trim()) {
      alert("Name and content are required");
      return;
    }

    try {
      setCreating(true);
      const placeholders = content.match(/\{\{(\w+)\}\}/g) || [];
      const newTemplate = await createTemplate({
        name: name.trim(),
        type,
        category: category.trim() || undefined,
        subject: type === "Email" ? subject.trim() : undefined,
        content: content.trim(),
        placeholders: placeholders.map((p) => p.replace(/[{}]/g, "")),
      });
      dispatch(addTemplate(newTemplate));
      setShowCreate(false);
      setName("");
      setContent("");
      setSubject("");
      setCategory("");
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setCreating(false);
    }
  };

  const previewContent = (template: Template) => {
    let preview = template.content;
    preview = preview.replace(/\{\{first_name\}\}/g, "John");
    preview = preview.replace(/\{\{plan\}\}/g, "Premium");
    preview = preview.replace(/\{\{lesson_count\}\}/g, "5");
    return preview;
  };

  if (!checkAccess(user.role, "marketing")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">Manage message templates</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Template name"
                  disabled={creating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as TemplateType)}
                  disabled={creating}
                >
                  <option value="Push">Push</option>
                  <option value="Email">Email</option>
                  <option value="In-App">In-App</option>
                </Select>
              </div>
            </div>

            {type === "Email" && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  disabled={creating}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Welcome, Promotion, etc."
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content * (Use {{placeholder}} for variables)</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Hello {{first_name}}, welcome to {{plan}}!"
                disabled={creating}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Available placeholders: {"{{first_name}}"}, {"{{plan}}"}, {"{{lesson_count}}"}
              </p>
            </div>

            {content && (
              <div className="border rounded-lg p-4 bg-muted">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <p className="text-sm">{previewContent({ content, placeholders: [] } as Template)}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Template"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Templates List</CardTitle>
          <CardDescription>{marketing.templates.length} template(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Placeholders</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketing.templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  marketing.templates.map((template) => (
                    <TableRow key={template._id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.type}</Badge>
                      </TableCell>
                      <TableCell>{template.category || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {template.placeholders.map((p) => (
                            <Badge key={p} variant="secondary" className="text-xs">
                              {`{{${p}}}`}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </div>
  );
}

