"use client";

import React, { useEffect, useState } from "react";
import { Radio, X } from "lucide-react";
import CommandInputPanel from "@/components/mil-layout/CommandInput";
import type { CommandFormAction } from "@/components/mil-layout/CommandInput";

const FloatingCommand = ({
  formAction,
  inline = false,
}: {
  formAction?: CommandFormAction;
  inline?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close command input" : "Open command input"}
        className={`hud-rail-btn lg:hidden ${inline ? "" : ""}`}
        onClick={() => setOpen((s) => !s)}
      >
        {open ? <X className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div className="relative w-full max-w-md mx-4 mb-6 lg:mb-0">
            <div className="hud-panel overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-primary animate-tactical-pulse" />
                  <h3 className="text-xs font-mono uppercase tracking-[0.22em] text-primary">
                    Orders uplink
                  </h3>
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

              <div className="p-2">
                <CommandInputPanel formAction={formAction} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCommand;
