"use client";

import { Trace } from "@/lib/types/developer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TraceViewerProps {
  trace: Trace;
}

export function TraceViewer({ trace }: TraceViewerProps) {
  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "HH:mm:ss.SSS");
    } catch {
      return timestamp;
    }
  };

  const getSlowestSpan = () => {
    return trace.spans.reduce((slowest, span) =>
      span.duration > slowest.duration ? span : slowest
    );
  };

  const slowestSpan = getSlowestSpan();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Trace Overview</CardTitle>
          <CardDescription>
            Request ID: <span className="font-mono">{trace.requestId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Trace ID</p>
              <p className="font-mono text-xs">{trace.traceId}</p>
            </div>
            <div>
              <p className="font-medium">Duration</p>
              <p className="font-mono">{trace.duration}ms</p>
            </div>
            <div>
              <p className="font-medium">Start Time</p>
              <p className="font-mono text-xs">{formatTime(trace.startTime)}</p>
            </div>
            <div>
              <p className="font-medium">Spans</p>
              <p>{trace.spans.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spans Timeline</CardTitle>
          <CardDescription>Service calls and their durations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trace.spans.map((span) => {
              const isSlowest = span._id === slowestSpan._id;
              return (
                <div
                  key={span._id}
                  className={`p-4 border rounded-lg ${
                    isSlowest ? "border-yellow-500 bg-yellow-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{span.service}</Badge>
                      <span className="font-medium text-sm">{span.operation}</span>
                      {isSlowest && (
                        <Badge variant="secondary" className="text-xs">
                          Slowest
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-mono">{span.duration}ms</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Span ID: <span className="font-mono">{span.spanId}</span></p>
                    <p>Start: <span className="font-mono">{formatTime(span.startTime)}</span></p>
                    {span.tags && Object.keys(span.tags).length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium mb-1">Tags:</p>
                        <div className="flex gap-1 flex-wrap">
                          {Object.entries(span.tags).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

