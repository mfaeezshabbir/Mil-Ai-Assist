"use client";

import type { SymbolData } from "@/types";
import {
  TRACK_COLORS,
  echelonTicks,
  trackClass,
  trackClassLabel,
  trackFrame,
  pieceIdentity,
  type TrackClass,
  type TrackFrame,
} from "@/lib/sim/track-style";

type TrackSymbolProps = {
  symbol: SymbolData;
  size?: number;
  selected?: boolean;
};

function ClassGlyph({ kind }: { kind: TrackClass }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
  };

  switch (kind) {
    case "infantry":
      return (
        <g>
          <path d="M-8 -8 L8 8 M8 -8 L-8 8" {...common} />
        </g>
      );
    case "armor":
      return <ellipse cx="0" cy="0" rx="10" ry="5.5" {...common} />;
    case "artillery":
      return <circle cx="0" cy="0" r="4.5" fill="currentColor" />;
    case "recon":
      return <path d="M-9 6 L0 -8 L9 6" {...common} />;
    case "aviation":
    case "air":
      return (
        <g>
          <path d="M-11 2 L0 -7 L11 2" {...common} />
          <path d="M0 -7 V9" {...common} />
        </g>
      );
    case "air-defence":
      return <path d="M-9 6 A9 9 0 0 1 9 6" {...common} />;
    case "engineer":
      return (
        <g>
          <path d="M-8 -6 H8 M-8 0 H8 M-8 6 H4" {...common} />
        </g>
      );
    case "signal":
      return <path d="M-2 -8 L6 0 L-2 0 L6 8" {...common} />;
    case "hq":
      return (
        <g>
          <path d="M-8 8 V-8 H2 L8 -2 H-8" {...common} />
        </g>
      );
    case "sof":
      return <path d="M0 -8 L8 8 H-8 Z" {...common} />;
    case "naval":
      return (
        <g>
          <path d="M-10 4 L-6 -4 H6 L10 4 Z" {...common} />
          <path d="M-12 8 H12" {...common} />
        </g>
      );
    case "subsurface":
      return <path d="M-10 4 Q0 -10 10 4" {...common} />;
    case "missile":
      return <path d="M0 -9 L5 8 H-5 Z" fill="currentColor" stroke="none" />;
    case "cbrn":
      return (
        <g>
          <circle cx="0" cy="-4" r="3" {...common} />
          <circle cx="-4.5" cy="4" r="3" {...common} />
          <circle cx="4.5" cy="4" r="3" {...common} />
        </g>
      );
    case "medical":
      return (
        <g>
          <path d="M-3 -8 H3 V-3 H8 V3 H3 V8 H-3 V3 H-8 V-3 H-3 Z" fill="currentColor" stroke="none" />
        </g>
      );
    case "logistics":
      return <path d="M-8 -5 H8 V5 H-8 Z M-3 -5 V5 M3 -5 V5" {...common} />;
    case "installation":
      return <path d="M-8 8 V-2 L0 -8 L8 -2 V8 Z" {...common} />;
    case "objective":
      return (
        <g>
          <path d="M-6 10 V-10 H8 L2 -4 H-6" fill="currentColor" stroke="none" />
        </g>
      );
    case "fob":
      return (
        <g>
          <path d="M-9 8 V-2 L0 -9 L9 -2 V8 Z" {...common} />
          <path d="M-3 8 V2 H3 V8" {...common} />
        </g>
      );
    case "supply":
      return <path d="M-8 -5 H8 V5 H-8 Z M-3 -5 V5 M3 -5 V5" {...common} />;
    case "minefield":
      return (
        <g>
          <circle cx="0" cy="0" r="3" fill="currentColor" />
          <circle cx="-7" cy="5" r="2" fill="currentColor" />
          <circle cx="7" cy="5" r="2" fill="currentColor" />
          <circle cx="-7" cy="-5" r="2" fill="currentColor" />
          <circle cx="7" cy="-5" r="2" fill="currentColor" />
        </g>
      );
    case "obstacle":
      return (
        <g>
          <path d="M-9 6 L-5 -6 L-1 6 M1 6 L5 -6 L9 6" {...common} />
        </g>
      );
    default:
      return (
        <g>
          <circle cx="0" cy="0" r="3" fill="currentColor" />
          <path d="M0 -9 V-5 M0 5 V9 M-9 0 H-5 M5 0 H9" {...common} />
        </g>
      );
  }
}

function FramePath({
  frame,
  stroke,
  fill,
}: {
  frame: TrackFrame;
  stroke: string;
  fill: string;
}) {
  const strokeWidth = 2.4;
  if (frame === "diamond") {
    return (
      <polygon
        points="32,8 56,32 32,56 8,32"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }
  if (frame === "square") {
    return (
      <rect
        x="12"
        y="12"
        width="40"
        height="40"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }
  if (frame === "circle") {
    return (
      <circle
        cx="32"
        cy="32"
        r="22"
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }
  return (
    <rect
      x="8"
      y="14"
      width="48"
      height="36"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

export function TrackSymbol({
  symbol,
  size = 40,
  selected = false,
}: TrackSymbolProps) {
  const identity = pieceIdentity(symbol);
  const frame = trackFrame(identity);
  const kind = trackClass(symbol);
  const colors = TRACK_COLORS[identity];
  const ticks = echelonTicks(symbol.symbolEchelon);
  const strength = Math.max(0, Math.min(100, symbol.strength ?? 100));
  const queued = symbol.order?.type === "move";
  const damaged =
    symbol.status === "Damaged" || symbol.status === "Destroyed";
  const destroyed = symbol.status === "Destroyed";
  const title = [
    symbol.aiLabel,
    trackClassLabel(kind),
    symbol.symbolStandardIdentity,
    symbol.symbolEchelon,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="block"
      style={{
        color: colors.stroke,
        filter: selected
          ? `drop-shadow(0 0 6px ${colors.glow})`
          : `drop-shadow(0 2px 4px rgba(0,0,0,0.65))`,
      }}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {selected && (
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.7"
        />
      )}
      <FramePath frame={frame} stroke={colors.stroke} fill={colors.fill} />
      <g transform="translate(32 32)">
        <ClassGlyph kind={kind} />
      </g>
      {ticks > 0 && (
        <g>
          {Array.from({ length: Math.min(ticks, 6) }).map((_, i) => {
            const count = Math.min(ticks, 6);
            const x = 32 - ((count - 1) * 4) / 2 + i * 4;
            return (
              <rect
                key={i}
                x={x - 1}
                y="4"
                width="2"
                height="6"
                fill={colors.stroke}
              />
            );
          })}
        </g>
      )}
      {(!symbol.pieceKind || symbol.pieceKind === "combat") && (
        <>
          <rect x="14" y="54" width="36" height="3" fill="rgba(0,0,0,0.55)" />
          <rect
            x="14"
            y="54"
            width={36 * (strength / 100)}
            height="3"
            fill={strength > 35 ? colors.stroke : "#F59E2A"}
          />
        </>
      )}
      {queued && (
        <polygon points="32,58 36,63 28,63" fill="#F59E2A" />
      )}
      {damaged && (
        <path
          d="M14 14 L50 50"
          stroke="#F59E2A"
          strokeWidth="2.4"
          opacity="0.95"
        />
      )}
      {destroyed && (
        <path
          d="M50 14 L14 50"
          stroke="#E23D3D"
          strokeWidth="2.4"
          opacity="0.95"
        />
      )}
    </svg>
  );
}

export default TrackSymbol;
