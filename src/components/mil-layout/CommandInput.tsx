"use client";

import React, { useEffect, useRef } from "react";
import { Crosshair, Send, Loader2, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";
function CommandInput({ action }: { action: any }) {
  const { pending } = useFormStatus();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return;
    if (pending) return;

    const mq = window.matchMedia("(min-width: 640px)");
    const isSmOrUp = mq.matches;
    const el = isSmOrUp ? inputRef.current : textareaRef.current;
    if (el) el.focus();
  }, [pending]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 bg-card/80 rounded-lg shadow-lg px-3 sm:px-4 py-2 sm:py-3 border border-primary/20 w-full">
      <span className="hidden md:flex items-center justify-center rounded-full bg-primary/10 p-2 mr-0 sm:mr-2 mb-2 sm:mb-0 self-start sm:self-auto">
        <Crosshair className="h-5 w-5 text-primary" />
      </span>
      {/* Show textarea on mobile, input on sm+ screens */}
      <Textarea
        name="command"
        ref={textareaRef}
        className="block sm:hidden flex-1 font-mono bg-transparent border-none focus:ring-0 focus-visible:ring-0 text-base resize rounded-md min-h-[44px] max-h-32"
        placeholder="Enter tactical command..."
        disabled={pending}
        required
        rows={5}
      />
      <Input
        name="command"
        ref={inputRef}
        className="hidden sm:block flex-1 font-mono bg-transparent border-none focus:ring-0 focus-visible:ring-0 text-base"
        placeholder="Enter tactical command..."
        disabled={pending}
        required
      />
      <Button
        type="submit"
        className="flex items-center gap-2 font-mono tracking-wide h-10 px-4 w-full sm:w-auto"
        size="sm"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          <>
            Execute
            <Send className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

// The panel component, merged and exported as default
const CommandInputPanel = ({ formAction }: { formAction: any }) => {
  return (
    <div className="md:p-4 md:border-t md:border-tactical border-primary/30 bg-background/90 backdrop-blur-sm w-full">
      <form action={formAction} className="space-y-2">
        <div className="hidden md:flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-accent shadow-md" />
            <h3 className="text-sm font-display uppercase tracking-wide text-primary">
              Tactical Command
            </h3>
          </div>
          <Badge
            variant="outline"
            className="font-mono text-xs border-primary/30 flex items-center justify-center"
          >
            <Radio className="h-3 w-3 mr-1 animate-tactical-pulse" />
            SECURE CHANNEL
          </Badge>
        </div>
        <CommandInput action={formAction} />
      </form>
    </div>
  );
};

export default CommandInputPanel;
