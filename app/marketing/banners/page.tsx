"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus, Loader2, Eye, Edit, Archive } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchBanners, createBanner } from "@/lib/api/marketing";
import { Banner } from "@/lib/types/marketing";
import { format } from "date-fns";

export default function BannersPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [targetPages, setTargetPages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "marketing")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "marketing")) {
      loadBanners();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const bannersData = await fetchBanners();
      setBanners(bannersData);
    } catch (error) {
      console.error("Error loading banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !content.trim()) {
      alert("Name and content are required");
      return;
    }

    try {
      setCreating(true);
      await createBanner({
        name: name.trim(),
        content: content.trim(),
        ctaText: ctaText.trim() || undefined,
        ctaLink: ctaLink.trim() || undefined,
        targetPages,
        isActive,
      });
      await loadBanners();
      setShowCreate(false);
      setName("");
      setContent("");
      setCtaText("");
      setCtaLink("");
      setTargetPages([]);
      setIsActive(false);
    } catch (error) {
      console.error("Error creating banner:", error);
    } finally {
      setCreating(false);
    }
  };

  if (!checkAccess(user.role, "marketing")) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">In-App Banners</h1>
          <p className="text-muted-foreground">Manage in-app banner messages</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Banner
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create Banner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Banner Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Banner name"
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (HTML) *</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<div>Banner content</div>"
                disabled={creating}
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaText">CTA Text</Label>
                <Input
                  id="ctaText"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Learn More"
                  disabled={creating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaLink">CTA Link</Label>
                <Input
                  id="ctaLink"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="/lessons"
                  disabled={creating}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Pages</Label>
              <div className="flex flex-wrap gap-2">
                {["home", "lesson", "profile"].map((page) => (
                  <label key={page} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={targetPages.includes(page)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetPages([...targetPages, page]);
                        } else {
                          setTargetPages(targetPages.filter((p) => p !== page));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{page}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

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
                  "Create Banner"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Banners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Banners List</CardTitle>
          <CardDescription>{banners.length} banner(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Target Pages</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No banners found
                      </TableCell>
                    </TableRow>
                  ) : (
                    banners.map((banner) => (
                      <TableRow key={banner._id}>
                        <TableCell className="font-medium">{banner.name}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {banner.targetPages.map((page) => (
                              <Badge key={page} variant="outline" className="text-xs">
                                {page}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={banner.isActive ? "default" : "secondary"}>
                            {banner.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(banner.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

