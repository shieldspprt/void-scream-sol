import React, { useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { RPC_ENDPOINT } from '@/config/constants';
import { getRpcEndpoint } from '@/utils/solana';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [endpoint, setEndpoint] = useState<string>(RPC_ENDPOINT);

  useEffect(() => {
    // Load custom RPC endpoint on component mount
    const loadRpcEndpoint = async () => {
      try {
        const customEndpoint = await getRpcEndpoint();
        console.log('WalletProvider using RPC:', customEndpoint.replace(/api-key=[^&]+/, 'api-key=***'));
        setEndpoint(customEndpoint);
      } catch (error) {
        console.warn('Failed to load custom RPC endpoint, using default:', error);
      }
    };

    loadRpcEndpoint();
  }, []);

  // Support multiple popular wallets for better UX
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};