import React, { useState, useRef } from 'react';
import { WalletProvider } from './WalletProvider';
import { WalletConnector } from './WalletConnector';
import { YellForm } from './YellForm';
import { WallOfScreams } from './WallOfScreams';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const YellexApp = () => {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-terminal relative overflow-hidden">
        {/* Terminal scanlines overlay */}
        <div className="scanlines absolute inset-0 pointer-events-none opacity-20" />
        
        {/* Header */}
        <header className="relative z-10 p-6">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <h1 
                className="text-4xl font-bold glitch cursor" 
                data-text="YELLEX"
              >
                YELLEX<span className="text-neon-pink">_</span>
              </h1>
              <div className="text-sm text-muted-foreground">
                &gt; scream_into_void.exe
              </div>
            </div>
            <WalletConnector />
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-6xl mx-auto px-6 pb-12">
          <Tabs defaultValue="yell" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 terminal-window">
              <TabsTrigger value="yell" className="btn-neon">
                &gt; YELL NOW
              </TabsTrigger>
              <TabsTrigger value="wall" className="btn-glitch">
                &gt; WALL OF SCREAMS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="yell">
              <YellForm />
            </TabsContent>

            <TabsContent value="wall">
              <WallOfScreams />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-primary/30 p-4">
          <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
            <span className="glitch" data-text="powered by rage and blockchain">
              powered by rage and blockchain
            </span>
            <span className="mx-2">|</span>
            <span className="text-neon-cyan">0.01 SOL per scream</span>
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
};

export default YellexApp;