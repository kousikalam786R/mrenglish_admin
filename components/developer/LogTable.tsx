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
import { Eye, Download } from "lucide-react";
import { LogEntry } from "@/lib/types/developer";
import { format } from "date-fns";

interface LogTableProps {
  logs: LogEntry[];
  onView: (log: LogEntry) => void;
  onDownload: (log: LogEntry) => void;
}

export function LogTable({ logs, onView, onDownload }: LogTableProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM dd, yyyy HH:mm:ss.SSS");
    } catch {
      return timestamp;
    }
  };

  const getLevelBadge = (level: LogEntry["level"]) => {
    const variants = {
      DEBUG: "secondary",
      INFO: "default",
      WARN: "outline",
      ERROR: "destructive",
    };
    return <Badge variant={variants[level] as any}>{level}</Badge>;
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Request ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell className="font-mono text-xs">
                  {formatTimestamp(log.timestamp)}
                </TableCell>
                <TableCell>{getLevelBadge(log.level)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{log.service}</Badge>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {log.message}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.requestId ? (
                    <button
                      onClick={() => {
                        // Navigate to trace
                        window.location.href = `/developer/traces?requestId=${log.requestId}`;
                      }}
                      className="text-primary hover:underline"
                    >
                      {log.requestId}
                    </button>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDownload(log)}
                    >
                      <Download className="h-4 w-4" />
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

