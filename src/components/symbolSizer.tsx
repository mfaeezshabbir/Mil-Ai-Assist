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
      <div
        aria-label={showSymbolSize ? "Close symbol sizer" : "Open symbol sizer"}
        className={
          "border-2 border-primary h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-primary text-white shadow-2xl flex items-center justify-center transform transition-transform duration-200 p-[2px]"
        }
        onClick={() => setShowSymbolSize((prev) => !prev)}
        role="button"
        tabIndex={0}
      >
        <ImageUpscale className="h-6 w-6" />
      </div>
      {showSymbolSize && (
        <div className="absolute right-0 mt-2 z-20 bg-black/60 backdrop-blur-md rounded-lg border border-white/30 p-2 shadow-lg flex flex-col items-center">
          <div className="text-[10px] text-white/60 mb-2 px-2 font-mono tracking-widest uppercase">
            Symbol Size
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
                className={`flex flex-col items-center px-2 py-1 rounded-lg transition-all border border-transparent
                                                                        ${
                                                                          symbolSize ===
                                                                          size
                                                                            ? "bg-white/20 text-white border-white/40 shadow"
                                                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                                                        }`}
                style={{ minWidth: 48 }}
              >
                <span
                  className="inline-block mb-1 rounded-full border border-white/30"
                  style={{
                    width: (pixels as number) / 2,
                    height: (pixels as number) / 2,
                    background: "rgba(255,255,255,0.15)",
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
