"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    kicker: "01 · Briefing",
    title: "Orders, then the turn",
    body: "This is a WEGO battle. You give every unit an order first. Nothing moves until you press End Turn. Both sides then act together.",
  },
  {
    kicker: "02 · Deploy",
    title: "Put forces on the map",
    body: "Use the left tray. Pick Blue or Red, click a piece, then click the map. Sample battle loads a ready fight around Islamabad.",
  },
  {
    kicker: "03 · Select",
    title: "Click a unit to command it",
    body: "The bottom dock shows HP, attack, and range. Deselect with the X, Esc, clicking the same unit again, or clicking empty ground.",
  },
  {
    kicker: "04 · Move",
    title: "Queue a march",
    body: "Select a combat unit, press Move, then click a destination. A dashed line means the order is queued. The unit only walks when the turn ends.",
  },
  {
    kicker: "05 · Fight",
    title: "Range destroys the enemy",
    body: "There is no Attack button. On End Turn, every combat unit fires at the best enemy inside its RNG. Damage comes off HP. At 0 HP the piece is destroyed.",
  },
  {
    kicker: "06 · Win",
    title: "Wipe them or hold ground",
    body: "Win by destroying all enemy combat units, or by holding every objective for two uncontested turns. Artillery cannot fire the turn it moves.",
  },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onLoadSample?: () => void;
};

export default function BattleTutorial({ open, onClose, onLoadSample }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  if (!open) return null;

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="relative w-full max-w-lg hud-panel p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary">
              {current.kicker}
            </div>
            <h2 className="font-display text-xl tracking-[0.12em] uppercase mt-1">
              {current.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close briefing"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {current.body}
        </p>

        <div className="flex items-center gap-1.5 mt-5">
          {STEPS.map((item, index) => (
            <button
              key={item.kicker}
              type="button"
              onClick={() => setStep(index)}
              className={`h-1.5 flex-1 ${
                index === step ? "bg-primary" : "bg-muted"
              }`}
              aria-label={`Step ${index + 1}`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-mono tracking-wide"
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            {last && onLoadSample && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-mono tracking-wide"
                onClick={() => {
                  onLoadSample();
                  onClose();
                }}
              >
                Load sample
              </Button>
            )}
            {last ? (
              <Button
                type="button"
                size="sm"
                className="font-mono tracking-wide"
                onClick={onClose}
              >
                Enter battle
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="font-mono tracking-wide"
                onClick={() =>
                  setStep((value) => Math.min(STEPS.length - 1, value + 1))
                }
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
