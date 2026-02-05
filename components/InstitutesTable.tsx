"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil, Trash2, Users } from "lucide-react";
import { Institute } from "@/lib/types/institute";

interface InstitutesTableProps {
  institutes: Institute[];
  onEdit: (inst: Institute) => void;
  onDelete: (inst: Institute) => void;
}

export function InstitutesTable({ institutes, onEdit, onDelete }: InstitutesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {institutes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No institutes found
              </TableCell>
            </TableRow>
          ) : (
            institutes.map((inst) => (
              <TableRow key={inst._id}>
                <TableCell className="font-medium">{inst.name}</TableCell>
                <TableCell>{inst.email}</TableCell>
                <TableCell>{inst.phone || "N/A"}</TableCell>
                <TableCell>{inst.address || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild title="View students">
                      <Link href={`/institutes/${inst._id}/students`}>
                        <Users className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(inst)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(inst)}
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                    >
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
  );
}
