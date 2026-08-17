"use client";

import React, { useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { Textarea } from "../ui/textarea";

export type CommandFormAction = (formData: FormData) => void | Promise<void>;

function CommandInput() {
  const { pending } = useFormStatus();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (pending) return;
    textareaRef.current?.focus();
  }, [pending]);

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="hidden sm:block font-mono text-primary text-sm select-none">
        &gt;
      </span>
      <Textarea
        name="command"
        ref={textareaRef}
        className="flex-1 font-mono bg-transparent border-none focus:ring-0 focus-visible:ring-0 text-sm resize-none min-h-9 max-h-9 p-0 placeholder:text-muted-foreground/70"
        placeholder="Move Raptors to Kabul"
        disabled={pending}
        required
        rows={1}
      />
      <Button
        type="submit"
        variant="outline"
        className="font-mono tracking-[0.16em] text-xs h-9 px-4"
        size="sm"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            LINK
          </>
        ) : (
          <>
            TRANSMIT
            <Send className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

const CommandInputPanel = ({
  formAction,
}: {
  formAction?: CommandFormAction;
}) => {
  return (
    <div className="hud-scan hud-panel border-x-0 border-b-0 px-4 py-3">
      <form action={formAction}>
        <div className="hidden md:flex items-center justify-between mb-2">
          <div className="font-mono text-[10px] tracking-[0.28em] text-primary uppercase">
            Orders uplink
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-tactical-pulse" />
            CHANNEL LIVE
          </div>
        </div>
        <CommandInput />
      </form>
    </div>
  );
};

export default CommandInputPanel;
