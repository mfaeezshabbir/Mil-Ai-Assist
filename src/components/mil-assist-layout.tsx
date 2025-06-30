'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Loader2, Send } from 'lucide-react';
import { getSymbolMetadata } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { SymbolData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapView } from '@/components/map-view';
import { Separator } from './ui/separator';

const initialState: { data: SymbolData | null; error: string | null } = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      <span>Generate Symbol</span>
    </Button>
  );
}

export function MilAssistLayout() {
  const [state, formAction] = useFormState(getSymbolMetadata, initialState);
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
  const [apiLog, setApiLog] = useState<object | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
    if (state.data) {
      const newSymbol: SymbolData = {
        ...state.data,
        id: new Date().toISOString() + Math.random(),
      };
      setSymbols((prev) => [...prev, newSymbol]);
      setApiLog(state.data);
    }
  }, [state, toast]);

  return (
    <div className="grid md:grid-cols-[380px_1fr] h-screen bg-background text-foreground">
      <aside className="p-4 flex flex-col gap-4 border-r bg-card/50 overflow-y-auto">
        <header>
          <h1 className="text-3xl font-bold font-headline text-primary">MilAIAssist</h1>
          <p className="text-muted-foreground">AI Mission Planner Assistant</p>
        </header>

        <Card className="flex-shrink-0">
          <CardHeader>
            <CardTitle>Natural Language Command</CardTitle>
            <CardDescription>Describe the military symbol to generate.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="command-input" className="sr-only">Enter your command:</Label>
                <Input
                  id="command-input"
                  name="command"
                  placeholder="A hostile armored unit at 33.68, 73.04..."
                  required
                  className="mt-1"
                  aria-label="Natural language command input"
                />
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
        
        <Separator />

        <Card className="flex-1 min-h-0">
          <CardHeader>
            <CardTitle>API Response Log</CardTitle>
            <CardDescription>Raw JSON output from the AI model.</CardDescription>
          </CardHeader>
          <CardContent className="h-full pb-2">
            <ScrollArea className="h-[calc(100%-4rem)] rounded-md border bg-muted">
              <pre className="text-sm p-3">
                {apiLog ? JSON.stringify(apiLog, null, 2) : 'Awaiting command...'}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>
      <main className="p-4 bg-gray-200/50">
        <MapView symbols={symbols} />
      </main>
    </div>
  );
}
