"use client";

import React, { useEffect, useState } from "react";
import { Radio, X } from "lucide-react";
import CommandInputPanel from "@/components/mil-layout/CommandInput";
import type { CommandFormAction } from "@/components/mil-layout/CommandInput";

const FloatingCommand = ({
  formAction,
  open: openProp,
  onOpenChange,
  hideTrigger = false,
}: {
  formAction?: CommandFormAction;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (openProp === undefined) setInternalOpen(next);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {!hideTrigger && (
        <button
          type="button"
          aria-label={open ? "Close command input" : "Open command input"}
          className="hud-rail-btn"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-lg mx-4 mb-6 sm:mb-0">
            <div className="hud-panel overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20">
                <div>
                  <div className="font-display text-sm tracking-[0.16em] uppercase text-primary">
                    AI orders
                  </div>
                  <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                    Optional command · not required to play
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close commands"
                  className="text-muted-foreground hover:text-foreground p-1"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-3">
                <CommandInputPanel formAction={formAction} compact />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCommand;
