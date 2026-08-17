import React from "react";
import { ImageUpscale } from "lucide-react";
import { SYMBOL_SIZES } from "./map-view";

type SymbolSizerProps = {
  symbolSize?: "small" | "medium" | "large" | "xxl";
  onSymbolSizeChange?: (s: "small" | "medium" | "large" | "xxl") => void;
};

const SymbolSizer: React.FC<SymbolSizerProps> = ({
  symbolSize,
  onSymbolSizeChange,
}) => {
  const [showSymbolSize, setShowSymbolSize] = React.useState(false);
  const sizerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!showSymbolSize) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        sizerRef.current &&
        !sizerRef.current.contains(event.target as Node)
      ) {
        setShowSymbolSize(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSymbolSize]);

  if (!onSymbolSizeChange) return null;

  return (
    <div className="lg:hidden" ref={sizerRef}>
      <button
        type="button"
        aria-label={showSymbolSize ? "Close symbol sizer" : "Open symbol sizer"}
        className="hud-rail-btn"
        onClick={() => setShowSymbolSize((prev) => !prev)}
      >
        <ImageUpscale className="h-4 w-4" />
      </button>
      {showSymbolSize && (
        <div className="absolute right-0 mt-2 z-20 hud-panel p-2 flex flex-col items-center min-w-[12rem]">
          <div className="text-[10px] text-primary mb-2 px-2 font-mono tracking-[0.22em] uppercase">
            Marker scale
          </div>
          <div className="flex flex-row gap-2 justify-center items-center">
            {Object.entries(SYMBOL_SIZES).map(([size, pixels]) => (
              <button
                key={size}
                onClick={() => {
                  onSymbolSizeChange(
                    size as "small" | "medium" | "large" | "xxl"
                  );
                  setShowSymbolSize(false);
                }}
                className={`flex flex-col items-center px-2 py-1 transition-all border
                  ${
                    symbolSize === size
                      ? "bg-primary/15 text-primary border-primary/50"
                      : "text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                  }`}
                style={{ minWidth: 48 }}
              >
                <span
                  className="inline-block mb-1 border border-primary/40"
                  style={{
                    width: (pixels as number) / 2,
                    height: (pixels as number) / 2,
                    background: "hsl(186 88% 48% / 0.2)",
                  }}
                />
                <span className="text-[11px] font-mono uppercase">{size}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymbolSizer;
