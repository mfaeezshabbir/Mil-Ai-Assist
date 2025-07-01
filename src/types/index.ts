import type { SIDCMetadataOutput as AIMetadata } from '@/ai/flows/extract-sidc-metadata';

export type SymbolData = Omit<AIMetadata, 'symbolCategory'> & {
  id: string;
  displayType: 'sidc' | 'image';
  imageUrl?: string;
  symbolSet: string;
  functionId: string;
  modifier1: string;
  modifier2: string;
  context: string;
  status: string;
  hqtfd: string;
  symbolEchelon?: string;
  // Text Amplifiers
  quantity?: string;
  reinforcedReduced?: string;
  staffComments?: string;
  additionalInformation?: string;
  higherFormation?: string;
  dtg?: string;
  type?: string;
  uniqueDesignation?: string;
  evaluationRating?: string;
  combatEffectiveness?: string;
  signatureEquipment?: string;
  specialHeadquarters?: string;
  iffSif?: string;
  // Graphic Amplifiers
  altitudeDepth?: string;
  location?: string;
  speed?: string;
  hostile?: string;
  direction?: string;
  // New Amplifiers
  commonIdentifier?: string;
  equipmentTeardownTime?: string;
  headquartersElement?: string;
  platformType?: string;
};
