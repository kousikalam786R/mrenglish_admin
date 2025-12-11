"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";

interface TicketComposerProps {
  onSend: (content: string, isInternal?: boolean) => Promise<void>;
  placeholder?: string;
  showInternalToggle?: boolean;
  disabled?: boolean;
}

export function TicketComposer({
  onSend,
  placeholder = "Type your message...",
  showInternalToggle = false,
  disabled = false,
}: TicketComposerProps) {
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      await onSend(content.trim(), isInternal);
      setContent("");
      setIsInternal(false);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      {showInternalToggle && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="internal"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
            disabled={disabled || sending}
            className="rounded"
          />
          <Label htmlFor="internal" className="text-sm">
            Internal note (visible only to support)
          </Label>
        </div>
      )}
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          className="flex-1 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSend}
          disabled={!content.trim() || sending || disabled}
          size="sm"
        >
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send {isInternal ? "Note" : "Reply"}
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Press Ctrl+Enter (or Cmd+Enter on Mac) to send
      </p>
    </div>
  );
}

