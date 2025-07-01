// This file contains comprehensive mappings for generating SIDC codes based on APP-6D standard.
import { toTitleCase } from './utils';

export const sidcEnumMapping = {
    context: {
        "REALITY": "0",
        "EXERCISE": "1",
        "SIMULATION": "2"
    },
    standardIdentity: {
        "PENDING": "0",
        "UNKNOWN": "1",
        "ASSUMED_FRIEND": "2",
        "FRIEND": "3",
        "NEUTRAL": "4",
        "SUSPECT": "5",
        "HOSTILE": "6"
    },
    symbolSet: {
        "UNKNOWN": "00",
        "AIR": "01",
        "AIR_MISSILE": "02",
        "SPACE": "05",
        "SPACE_MISSILE": "06",
        "LAND_UNIT": "10",
        "LAND_CIVILIAN": "11",
        "LAND_EQUIPMENT": "15",
        "LAND_INSTALLATION": "20",
        "CONTROL_MEASURE": "25",
        "DISMOUNTED_INDIVIDUAL": "27",
        "SEA_SURFACE": "30",
        "SUBSURFACE": "35",
        "SEA_MINE": "36",
        "ACTIVITIES": "40",
        "SIGINT_AIR": "50",
        "SIGINT_SPACE": "51",
        "SIGINT_LAND": "52",
        "SIGINT_SURFACE": "53",
        "SIGINT_SUBSURFACE": "54",
        "CYBERSPACE": "60"
    },
    status: {
        "PRESENT": "0",
        "PLANNED": "1",
        "FULLY_CAPABLE": "2",
        "DAMAGED": "3",
        "DESTROYED": "4",
        "FULL_TO_CAPACITY": "5"
    },
    hqtfd: {
        "NOT_APPLICABLE": "0",
        "FEINT_DUMMY": "1",
        "HEADQUARTERS": "2",
        "FEINT_DUMMY_HEADQUARTERS": "3",
        "TASK_FORCE": "4",
        "FEINT_DUMMY_TASK_FORCE": "5",
        "TASK_FORCE_HEADQUARTERS": "6",
        "FEINT_DUMMY_TASK_FORCE_HEADQUARTERS": "7"
    },
    echelonMobilityTowedArray: {
        "UNSPECIFIED": "00",
        "TEAM": "11",
        "SQUAD": "12",
        "SECTION": "13",
        "PLATOON": "14",
        "COMPANY": "15",
        "BATTALION": "16",
        "REGIMENT": "17",
        "BRIGADE": "18",
        "DIVISION": "21",
        "CORPS": "22",
        "ARMY": "23",
        "ARMY_GROUP_FRONT": "24",
        "REGION_THEATER": "25",
        "COMMAND": "26",
    }
};

// Simplified for now, but can be expanded with all the data provided.
export const LandUnitSymbolSet10 = {
    COMMAND_AND_CONTROL: "110000",
    BROADCAST_TRANSMITTER_ANTENNA: "110100",
    CIVIL_AFFAIRS: "110200",
    CIVIL_MILITARY_COOPERATION: "110300",
    INFORMATION_OPERATIONS: "110400",
    LIAISON: "110500",
    MILITARY_INFORMATION_SUPPORT_OPERATIONS: "110600",
    SIGNAL: "111000",
    SPACE: "111300",
    AMPHIBIOUS: "120300",
    ANTITANK_ANTIARMOUR: "120400",
    ARMOUR: "120500",
    AVIATION_ROTARY_WING: "120600",
    AVIATION_FIXED_WING: "120800",
    COMBAT: "120900",
    COMBINED_ARMS: "121000",
    INFANTRY: "121100",
    RECONNAISSANCE: "121300",
    SPECIAL_FORCES: "121700",
    SPECIAL_OPERATIONS_FORCES: "121800",
    UNMANNED_SYSTEMS: "121900",
    AIR_DEFENCE: "130100",
    FIELD_ARTILLERY: "130300",
    MORTAR: "130800",
    CBRN: "140100",
    ENGINEER: "140700",
    MILITARY_POLICE: "141200",
    SECURITY: "141700",
    MILITARY_INTELLIGENCE: "151000",
    SUSTAINMENT: "160000",
    MAINTENANCE: "161100",
    MEDICAL: "161300",
    ORDNANCE: "162300",
    TRANSPORTATION: "163600",
};

const LandUnitModifier1 = {
    AIRMOBILE_AIR_ASSAULT: "01",
    ATTACK: "03",
    BRIDGING: "06",
    CHEMICAL: "07",
    COMBAT: "09",
    COMMAND_AND_CONTROL: "10",
    CONSTRUCTION: "12",
    DECONTAMINATION: "15",
    DOG: "20",
    EXPLOSIVE_ORDNANCE_DISPOSAL: "24",
    MAINTENANCE: "31",
    MISSILE: "34",
    MOBILITY_SUPPORT: "37",
    MULTIPLE_ROCKET_LAUNCHER: "41",
    NAVAL: "46",
    NUCLEAR: "48",
    RADAR: "50",
    RADIOLOGICAL: "52",
    SECURITY: "54",
    SENSOR: "55",
    SNIPER: "61",
    SPECIAL_OPERATIONS_FORCES: "63",
    TARGET_ACQUISITION: "67",
    UTILITY: "69",
};

const LandUnitModifier2 = {
    AIRBORNE: "01",
    ARCTIC: "02",
    HEAVY: "15",
    LIGHT: "19",
    MEDIUM: "24",
    MOUNTAIN: "27",
    RAILROAD: "36",
    SKI: "42",
    TOWED: "47",
    WHEELED: "51",
    AMPHIBIOUS: "60",
};


// Helper function to format options for the Select component
const formatOptions = (obj: Record<string, string>) => {
    return [{name: "Unspecified", code: "00"}, ...Object.entries(obj).map(([name, code]) => ({
        name: toTitleCase(name),
        code
    }))];
};

const emptySet = { mainIcons: [], modifier1: [], modifier2: [] };

export const symbolSetData: Record<string, {
    mainIcons: { name: string, code: string }[],
    modifier1?: { name: string, code: string }[],
    modifier2?: { name: string, code: string }[]
}> = {
    'Land Unit': {
        mainIcons: formatOptions(LandUnitSymbolSet10),
        modifier1: formatOptions(LandUnitModifier1),
        modifier2: formatOptions(LandUnitModifier2),
    },
    'Air': emptySet,
    'Air Missile': emptySet,
    'Space': emptySet,
    'Space Missile': emptySet,
    'Land Civilian': emptySet,
    'Land Equipment': emptySet,
    'Land Installation': emptySet,
    'Control Measure': emptySet,
    'Dismounted Individual': emptySet,
    'Sea Surface': emptySet,
    'Subsurface': emptySet,
    'Sea Mine': emptySet,
    'Activities': emptySet,
    'SIGINT Air': emptySet,
    'SIGINT Space': emptySet,
    'SIGINT Land': emptySet,
    'SIGINT Surface': emptySet,
    'SIGINT Subsurface': emptySet,
    'Cyberspace': emptySet,
    'Unknown': emptySet,
};

export function getFunctionIdName(symbolSet: string, functionId: string): string {
    const set = symbolSetData[symbolSet]?.mainIcons;
    if (!set) return 'Unknown Function';
    
    const entry = set.find(item => item.code === functionId);
    return entry ? entry.name : 'Unknown Function';
}

export function findFunctionId(symbolSet: string, categoryName?: string): string | undefined {
    if (!categoryName) return undefined;

    const setData = symbolSetData[symbolSet];
    if (!setData) return undefined;

    const normalizedCategory = categoryName.replace(/\s+/g, '_').toUpperCase();
    
    // Exact match first
    let icon = Object.entries(LandUnitSymbolSet10).find(([key,]) => key === normalizedCategory);
    if(icon) return icon[1];
    
    // Partial match
    icon = Object.entries(LandUnitSymbolSet10).find(([key,]) => key.includes(normalizedCategory));
    if(icon) return icon[1];

    return undefined;
}
