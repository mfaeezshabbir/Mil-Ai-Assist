import ms from "milsymbol";

export type DrawnSymbol = {
  validIcon: boolean;
  asSVG: () => string;
  getSize: () => { width: number; height: number };
  isValid: (extended?: boolean) => boolean | object;
  metadata?: {
    affiliation?: string;
    context?: string;
    dimension?: string;
    echelon?: string;
    headquarters?: boolean;
    taskForce?: boolean;
    activity?: boolean;
    civilian?: boolean;
    condition?: string;
    functionid?: string;
  };
};

type SymbolCtor = new (
  sidc: string,
  options?: Record<string, unknown>
) => DrawnSymbol;

type MSLib = { Symbol: SymbolCtor; default?: { Symbol: SymbolCtor } };

export function milsymbolLib(): { Symbol: SymbolCtor } {
  const mod = ms as unknown as MSLib;
  if (typeof mod?.Symbol === "function") return mod;
  if (typeof mod?.default?.Symbol === "function") return mod.default;
  throw new Error("milsymbol Symbol constructor is not available");
}

export function createMilSymbol(
  sidc: string,
  options?: Record<string, unknown>
): DrawnSymbol {
  const { Symbol } = milsymbolLib();
  return new Symbol(sidc, options);
}
