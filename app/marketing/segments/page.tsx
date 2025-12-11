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
import { Plus, Loader2, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchSegments, createSegment } from "@/lib/api/marketing";
import { setSegments, addSegment } from "@/redux/slices/marketingSlice";
import { Segment, SegmentFilter } from "@/lib/types/marketing";

export default function SegmentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const marketing = useAppSelector((state) => state.marketing);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [filters, setFilters] = useState<SegmentFilter[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "marketing")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "marketing")) {
      loadSegments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadSegments = async () => {
    try {
      const segments = await fetchSegments();
      dispatch(setSegments(segments));
    } catch (error) {
      console.error("Error loading segments:", error);
    }
  };

  const addFilter = () => {
    setFilters([
      ...filters,
      { field: "country", operator: "equals", value: "" },
    ]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof SegmentFilter, value: any) => {
    const updated = [...filters];
    updated[index] = { ...updated[index], [field]: value };
    setFilters(updated);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    try {
      setCreating(true);
      const newSegment = await createSegment({
        name: name.trim(),
        description: description.trim() || undefined,
        isPredefined: false,
        filters: filters.filter((f) => f.value),
      });
      dispatch(addSegment(newSegment));
      setShowCreate(false);
      setName("");
      setDescription("");
      setFilters([]);
    } catch (error) {
      console.error("Error creating segment:", error);
    } finally {
      setCreating(false);
    }
  };

  if (!checkAccess(user.role, "marketing")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Segments</h1>
          <p className="text-muted-foreground">Build and manage user segments</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Segment
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create Custom Segment</CardTitle>
            <CardDescription>Build a custom user segment using filters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Segment Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Segment name"
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Segment description"
                disabled={creating}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Filters</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Filter
                </Button>
              </div>

              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Field</Label>
                      <Select
                        value={filter.field}
                        onChange={(e) => updateFilter(index, "field", e.target.value)}
                        disabled={creating}
                      >
                        <option value="country">Country</option>
                        <option value="lastActive">Last Active</option>
                        <option value="plan">Plan</option>
                        <option value="gender">Gender</option>
                        <option value="lessonsCompleted">Lessons Completed</option>
                        <option value="callsCount">Calls Count</option>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label>Operator</Label>
                      <Select
                        value={filter.operator}
                        onChange={(e) => updateFilter(index, "operator", e.target.value)}
                        disabled={creating}
                      >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="contains">Contains</option>
                        <option value="in">In</option>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label>Value</Label>
                      <Input
                        value={String(filter.value)}
                        onChange={(e) => updateFilter(index, "value", e.target.value)}
                        placeholder="Value"
                        disabled={creating}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFilter(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>

              {filters.length > 0 && (
                <div className="border rounded-lg p-4 bg-muted">
                  <p className="text-sm font-medium mb-2">Estimated Users:</p>
                  <p className="text-2xl font-bold">~{Math.floor(Math.random() * 2000) + 100}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sample count (mock)
                  </p>
                </div>
              )}
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
                  "Create Segment"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Segments List</CardTitle>
          <CardDescription>{marketing.segments.length} segment(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User Count</TableHead>
                  <TableHead>Filters</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketing.segments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No segments found
                    </TableCell>
                  </TableRow>
                ) : (
                  marketing.segments.map((segment) => (
                    <TableRow key={segment._id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{segment.name}</p>
                          {segment.description && (
                            <p className="text-xs text-muted-foreground">
                              {segment.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={segment.isPredefined ? "default" : "secondary"}>
                          {segment.isPredefined ? "Predefined" : "Custom"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {segment.userCount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {segment.filters.slice(0, 3).map((filter, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {filter.field} {filter.operator} {String(filter.value)}
                            </Badge>
                          ))}
                          {segment.filters.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{segment.filters.length - 3} more
                            </Badge>
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
    </div>
  );
}

