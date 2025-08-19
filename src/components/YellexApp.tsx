import React, { useState } from 'react';
import { WalletProvider } from './WalletProvider';
import { WalletConnector } from './WalletConnector';
import { YellForm } from './YellForm';
import { WallOfScreams } from './WallOfScreams';
import { TopScreams } from './TopScreams';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';


const YellexApp = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  const handleSuccessfulPost = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTriggerAIPost = async () => {
    try {
      setPosting(true);
      const { data, error } = await supabase.functions.invoke('auto-post-screams', {
        body: { trigger: 'manual_test' }
      });
      if (error) throw error;
      toast({
        title: 'AI scream posted',
        description: `Posted ${data?.screams?.length ?? 0} AI scream(s).`
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (e: any) {
      toast({
        title: 'Failed to post AI scream',
        description: e.message,
        variant: 'destructive' as any
      });
    } finally {
      setPosting(false);
    }
  };

  return (
    <WalletProvider>
      <div className="h-screen bg-gradient-terminal relative overflow-hidden flex flex-col">
        {/* Terminal scanlines overlay */}
        <div className="scanlines absolute inset-0 pointer-events-none opacity-20" />
        
        {/* Header */}
        <header className="relative z-10 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <h1 
                className="text-3xl md:text-4xl font-bold glitch cursor" 
                data-text="YELLEX"
              >
                YELLEX<span className="text-neon-pink">_</span>
              </h1>
              <div className="text-xs md:text-sm text-muted-foreground">
                &gt; scream_into_void.exe
              </div>
            </div>
            <div className="flex items-center gap-2">
              <WalletConnector />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTriggerAIPost}
                disabled={posting}
                aria-label="Trigger AI scream now"
              >
                {posting ? 'Posting…' : 'Trigger AI Scream'}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - Split Layout */}
        <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-6 px-4 md:px-6 pb-24 overflow-hidden">
          {/* Left Pane - Posting/Recording (Always Visible) */}
          <div className="w-full lg:w-96 lg:min-w-96 lg:max-w-96 flex-shrink-0 overflow-y-auto space-y-6">
            <YellForm onSuccessfulPost={handleSuccessfulPost} />
            <TopScreams refreshTrigger={refreshTrigger} />
          </div>
          
          {/* Right Pane - Wall of Screams (Scrollable) */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <WallOfScreams refreshTrigger={refreshTrigger} />
          </div>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-primary/30 p-3">
          <div className="max-w-6xl mx-auto text-center text-xs md:text-sm text-muted-foreground">
            <span className="glitch" data-text="powered by rage and blockchain">
              powered by rage and blockchain
            </span>
            <span className="mx-2">|</span>
            <span className="text-neon-cyan">Post: 0.01 SOL</span>
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
};

export default YellexApp;