import React, { useState } from 'react';
import { WalletProvider } from './WalletProvider';
import { WalletConnector } from './WalletConnector';
import { QuickYellForm } from './QuickYellForm';
import { YellForm } from './YellForm';
import { WallOfScreams } from './WallOfScreams';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const YellexApp = () => {
  const [activeTab, setActiveTab] = useState("quick");

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-terminal relative overflow-hidden">
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
            <WalletConnector />
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 pb-24 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 terminal-window h-12 mx-auto max-w-md">
              <TabsTrigger value="quick" className="font-mono text-sm py-2">
                🚀 Quick Yell
              </TabsTrigger>
              <TabsTrigger value="advanced" className="font-mono text-sm py-2">
                🎤 Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="space-y-8">
              <QuickYellForm />
            </TabsContent>

            <TabsContent value="advanced" className="space-y-8">
              <YellForm />
            </TabsContent>
          </Tabs>
          
          <WallOfScreams />
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-primary/30 p-3">
          <div className="max-w-6xl mx-auto text-center text-xs md:text-sm text-muted-foreground">
            <span className="glitch" data-text="powered by rage and blockchain">
              powered by rage and blockchain
            </span>
            <span className="mx-2">|</span>
            <span className="text-neon-cyan">Post: 0.01 SOL • Burn: FREE</span>
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
};

export default YellexApp;