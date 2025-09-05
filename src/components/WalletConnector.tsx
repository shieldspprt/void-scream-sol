import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';

export const WalletConnector = () => {
  const { publicKey, connected, disconnect } = useWallet();

  return (
    <div className="flex items-center gap-4">
      {connected && publicKey ? (
        <div className="flex items-center gap-2">
          <div className="terminal-window px-3 py-2">
            <span className="text-neon-green text-sm font-mono">
              {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </span>
          </div>
          <Button 
            onClick={disconnect}
            variant="secondary"
            size="sm"
            className="btn-neon bg-secondary text-secondary-foreground border-2 border-secondary opacity-100"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="wallet-adapter-button-trigger">
          <WalletMultiButton className="btn-neon !bg-primary !text-primary-foreground hover:!bg-primary/80 !border-2 !border-primary !rounded !font-bold !transition-all !duration-200 hover:!shadow-glow-neon !opacity-100" />
        </div>
      )}
    </div>
  );
};