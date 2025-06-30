'use server';

import { extractSIDCMetadata, type SIDCMetadataOutput } from '@/ai/flows/extract-sidc-metadata';

export async function getSymbolMetadata(
  prevState: { data: SIDCMetadataOutput | null; error: string | null },
  formData: FormData
): Promise<{ data: SIDCMetadataOutput | null; error: string | null }> {
  const command = formData.get('command') as string;
  if (!command) {
    return { data: null, error: 'Command cannot be empty.' };
  }

  try {
    const metadata = await extractSIDCMetadata({ naturalLanguageCommand: command });
    return { data: metadata, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to process command: ${errorMessage}` };
  }
}
