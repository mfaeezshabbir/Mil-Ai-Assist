"use client";

import React from "react";
import { Crosshair, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export default function CommandInput({ action }: { action: any }) {
  const { pending } = useFormStatus();

  return (
    <form
      action={action}
      className="flex items-center gap-2 bg-card/80 rounded-lg shadow-lg px-4 py-3 border border-primary/20"
      autoComplete="off"
    >
      <span className="flex items-center justify-center rounded-full bg-primary/10 p-2 mr-2">
        <Crosshair className="h-5 w-5 text-primary" />
      </span>
      <Input
        name="command"
        className="flex-1 font-mono bg-transparent border-none focus:ring-0 focus-visible:ring-0 text-base"
        placeholder="Enter tactical command..."
        disabled={pending}
        required
        autoFocus
      />
      <Button
        type="submit"
        className="flex items-center gap-2 font-mono tracking-wide h-10 px-4"
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
    </form>
  );
}
