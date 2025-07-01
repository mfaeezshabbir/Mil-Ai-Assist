import type { SIDCMetadataOutput as AIMetadata } from '@/ai/flows/extract-sidc-metadata';

export type SymbolData = Omit<AIMetadata, 'symbolCategory'> & {
  id: string;
  symbolSet: string;
  functionId: string;
  modifier1: string;
  modifier2: string;
  context: string;
  status: string;
  hqtfd: string;
  symbolEchelon?: string;
};
