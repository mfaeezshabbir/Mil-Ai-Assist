"use client";

import { X } from "lucide-react";

export type TurnReportData = {
  turn: number;
  friendBefore: number;
  friendAfter: number;
  hostileBefore: number;
  hostileAfter: number;
  destroyed: string[];
  lines: string[];
};

type Props = {
  report: TurnReportData | null;
  onClose: () => void;
};

export default function TurnReport({ report, onClose }: Props) {
  if (!report) return null;

  const friendDelta = report.friendAfter - report.friendBefore;
  const hostileDelta = report.hostileAfter - report.hostileBefore;
  const deltaText = (value: number) =>
    value === 0 ? "no change" : value > 0 ? `+${value}` : String(value);

  return (
    <div className="absolute right-14 top-3 z-30 w-[22rem] max-w-[calc(100%-8rem)] hud-panel pointer-events-auto p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-secondary">
            After action · Turn {String(report.turn).padStart(2, "0")}
          </div>
          <div className="font-display text-sm tracking-wide uppercase mt-0.5">
            Blue {report.friendAfter}{" "}
            <span className="text-muted-foreground font-mono text-[10px]">
              ({deltaText(friendDelta)})
            </span>
            {"  "}
            Red {report.hostileAfter}{" "}
            <span className="text-muted-foreground font-mono text-[10px]">
              ({deltaText(hostileDelta)})
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close report"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
        {report.destroyed.length > 0
          ? `Destroyed: ${report.destroyed.join(", ")}`
          : "No units destroyed this turn"}
      </div>
      <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[11px] leading-snug text-foreground/90">
        {report.lines.length === 0 ? (
          <div className="text-muted-foreground">Forces moved. No shots fired.</div>
        ) : (
          report.lines.map((line, index) => (
            <div key={`${index}-${line}`}>{line}</div>
          ))
        )}
      </div>
    </div>
  );
}
