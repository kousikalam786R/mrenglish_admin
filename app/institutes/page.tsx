"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InstitutesTable } from "@/components/InstitutesTable";
import { InstituteFormModal } from "@/components/InstituteFormModal";
import { Institute, InstituteFormData } from "@/lib/types/institute";
import {
  fetchInstitutes,
  createInstitute,
  updateInstitute,
  deleteInstitute,
} from "@/lib/api/institutes";
import { Loader2, Plus } from "lucide-react";
import { confirmAction } from "@/lib/utils/confirm";

export default function InstitutesPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState<Institute | null>(null);

  useEffect(() => {
    if (!checkAccess(user.role, "institutes")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  const loadInstitutes = async () => {
    setLoading(true);
    try {
      const list = await fetchInstitutes();
      setInstitutes(list);
    } catch (err) {
      console.error("Error fetching institutes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checkAccess(user.role, "institutes")) {
      loadInstitutes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const handleEdit = (inst: Institute) => {
    setEditingInstitute(inst);
    setFormOpen(true);
  };

  const handleDelete = async (inst: Institute) => {
    const ok = await confirmAction(
      `Are you sure you want to delete "${inst.name}"? This will remove the institute and its student records.`
    );
    if (!ok) return;
    try {
      await deleteInstitute(inst._id);
      loadInstitutes();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleCreate = () => {
    setEditingInstitute(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: InstituteFormData) => {
    if (editingInstitute) {
      await updateInstitute(editingInstitute._id, data);
    } else {
      await createInstitute(data);
    }
    loadInstitutes();
  };

  if (!checkAccess(user.role, "institutes")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Institutes</h1>
        <p className="text-muted-foreground">
          Manage institutes — view list, create, edit, delete, and view each institute&apos;s students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Institute List</CardTitle>
              <CardDescription>{institutes.length} institutes</CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Institute
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <InstitutesTable
              institutes={institutes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <InstituteFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingInstitute}
        onSubmit={handleFormSubmit}
        title={editingInstitute ? "Edit Institute" : "Add Institute"}
        description={editingInstitute ? "Update institute details." : "Create a new institute account."}
      />
    </div>
  );
}
