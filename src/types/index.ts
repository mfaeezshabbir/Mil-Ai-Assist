import type { SIDCMetadataOutput as AIMetadata } from '@/ai/flows/extract-sidc-metadata';

export type SymbolData = Omit<AIMetadata, 'symbolCategory'> & {
  id: string;
  functionId: string;
};
