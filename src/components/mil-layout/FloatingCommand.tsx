"use client";

import React, { useEffect, useState } from "react";
import { Brain, X } from "lucide-react";
import CommandInputPanel from "@/components/mil-layout/CommandInput";
import { Button } from "../ui/button";

const FloatingCommand = ({
  formAction,
  inline = false,
}: {
  formAction: any;
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
      <div
        aria-label={open ? "Close command input" : "Open command input"}
        className={
          (inline
            ? "inline-flex items-center gap-2 rounded-md p-2 bg-gradient-to-br from-accent to-primary text-white shadow-md cursor-pointer"
            : "border-2 border-primary h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-primary text-white shadow-2xl flex items-center justify-center transform transition-transform duration-200 p-[2px]") +
          " lg:hidden"
        }
        onClick={() => setOpen((s) => !s)}
      >
        <Brain className="h-6 w-6" />
      </div>

      {/* Panel as Sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div className="relative h-2/3 w-full max-w-md mx-4 mb-6 lg:mb-0 lg:mx-auto">
            <div className="bg-background/90 backdrop-blur-md border border-primary/20 rounded-t-xl lg:rounded-xl shadow-tactical overflow-hidden transform transition-all duration-300 animate-slide-in-up lg:animate-none">
              <div className="flex items-center justify-between px-4 py-2 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent shadow-md" />
                  <h3 className="text-sm font-display uppercase tracking-wide text-primary">
                    Tactical Command
                  </h3>
                </div>
                <button
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
