// SIDC Generation Logic
import type { SymbolData } from '@/types';

const sidcMapping = {
    standardIdentity: {
        PENDING: "0",
        UNKNOWN: "1",
        ASSUMED_FRIEND: "2",
        FRIEND: "3",
        NEUTRAL: "4",
        SUSPECT: "5",
        HOSTILE: "6"
    },
    status: {
        PRESENT: "0",
        PLANNED: "1",
        FULLY_CAPABLE: "2",
        DAMAGED: "3",
        DESTROYED: "4",
        FULL_TO_CAPACITY: "5"
    },
    hqtfd: {
        NOT_APPLICABLE: "0",
        FEINT_DUMMY: "1",
        HEADQUARTERS: "2",
        FEINT_DUMMY_HEADQUARTERS: "3",
        TASK_FORCE: "4",
        FEINT_DUMMY_TASK_FORCE: "5",
        TASK_FORCE_HEADQUARTERS: "6",
        FEINT_DUMMY_TASK_FORCE_HEADQUARTERS: "7"
    },
    echelon: {
        TEAM: "11",
        SQUAD: "12",
        SECTION: "13",
        PLATOON: "14",
        COMPANY: "15",
        BATTALION: "16",
        REGIMENT: "17",
        BRIGADE: "18",
        DIVISION: "21",
        CORPS: "22",
        ARMY: "23",
    },
    functionId: {
        INFANTRY: "121100",
        ARMORED: "120300",
        UNKNOWN: "000000"
    }
};

function normalize(str: string): string {
    return str.replace(/\s/g, '_').toUpperCase();
}

export function generateSIDC(symbol: SymbolData): string {
    const version = "10"; // APP-6D
    const context = "0"; // Reality
    
    const identityKey = normalize(symbol.symbolStandardIdentity) as keyof typeof sidcMapping.standardIdentity;
    const standardIdentityCode = sidcMapping.standardIdentity[identityKey] || "1"; // Default to Unknown

    // For now, hardcode symbol set to Land Unit (10) as we only have land categories.
    const symbolSetCode = "10"; 

    const statusCode = symbol.symbolDamaged ? sidcMapping.status.DAMAGED : sidcMapping.status.PRESENT;

    let hqtfdCode = sidcMapping.hqtfd.NOT_APPLICABLE;
    if (symbol.symbolTaskForce) {
        hqtfdCode = sidcMapping.hqtfd.TASK_FORCE_HEADQUARTERS; // Assumption: a task force is also a HQ
    }

    const echelonKey = symbol.symbolEchelon ? normalize(symbol.symbolEchelon) as keyof typeof sidcMapping.echelon : null;
    const echelonCode = echelonKey ? (sidcMapping.echelon[echelonKey] || "00") : "00";

    const functionKey = normalize(symbol.symbolCategory) as keyof typeof sidcMapping.functionId;
    const functionIdCode = sidcMapping.functionId[functionKey] || sidcMapping.functionId.UNKNOWN;
    
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
