// SIDC Generation Logic
import type { SymbolData } from '@/types';
import { sidcEnumMapping } from './sidc-mappings';

function normalize(str: string | undefined): string {
    if (!str) return '';
    return str.replace(/\s/g, '_').toUpperCase();
}

export function generateSIDC(symbol: SymbolData): string {
    const version = "10"; // APP-6D
    const context = "0"; // Reality
    
    const identityKey = normalize(symbol.symbolStandardIdentity) as keyof typeof sidcEnumMapping.standardIdentity;
    const standardIdentityCode = sidcEnumMapping.standardIdentity[identityKey] || "1"; // Default to Unknown

    // For now, hardcode symbol set to Land Unit (10) as we only have land categories.
    const symbolSetCode = "10"; 

    const statusCode = symbol.symbolDamaged ? sidcEnumMapping.status.DAMAGED : sidcEnumMapping.status.PRESENT;

    let hqtfdCode = sidcEnumMapping.hqtfd.NOT_APPLICABLE;
    if (symbol.symbolTaskForce) {
        hqtfdCode = sidcEnumMapping.hqtfd.TASK_FORCE_HEADQUARTERS; // Assumption: a task force is also a HQ
    }

    const echelonKey = symbol.symbolEchelon ? normalize(symbol.symbolEchelon) as keyof typeof sidcEnumMapping.echelonMobilityTowedArray : null;
    const echelonCode = echelonKey ? (sidcEnumMapping.echelonMobilityTowedArray[echelonKey] || "00") : "00";

    const functionIdCode = symbol.functionId || "000000"; // Use functionId from SymbolData
    
    const modifier1 = "00";
    const modifier2 = "00";

    const sidc = version +
                 context +
                 standardIdentityCode +
                 symbolSetCode +
                 statusCode +
                 hqtfdCode +
                 echelonCode +
                 functionIdCode +
                 modifier1 +
                 modifier2;

    return sidc;
}
