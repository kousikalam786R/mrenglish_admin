"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Copy, Square } from "lucide-react";
import { Campaign } from "@/lib/types/marketing";
import { format } from "date-fns";
import Link from "next/link";

interface CampaignTableProps {
  campaigns: Campaign[];
  onView: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDuplicate: (campaign: Campaign) => void;
  onStop: (campaign: Campaign) => void;
}

export function CampaignTable({
  campaigns,
  onView,
  onEdit,
  onDuplicate,
  onStop,
}: CampaignTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const getStatusBadge = (status: Campaign["status"]) => {
    const variants = {
      Draft: "secondary",
      Scheduled: "default",
      Running: "default",
      Paused: "outline",
      Completed: "secondary",
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Target Segment</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent / Open / Click</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                No campaigns found
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((campaign) => (
              <TableRow key={campaign._id}>
                <TableCell className="font-mono text-sm">
                  {campaign.campaignId}
                </TableCell>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{campaign.type}</Badge>
                </TableCell>
                <TableCell>{campaign.segmentName}</TableCell>
                <TableCell className="text-sm">
                  {formatDate(campaign.startDate)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(campaign.endDate)}
                </TableCell>
                <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                <TableCell className="text-sm">
                  {campaign.metrics.sent.toLocaleString()} /{" "}
                  {campaign.metrics.opened.toLocaleString()} /{" "}
                  {campaign.metrics.clicked.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(campaign)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {campaign.status === "Draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(campaign)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDuplicate(campaign)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {(campaign.status === "Running" || campaign.status === "Scheduled") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStop(campaign)}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    )}
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

