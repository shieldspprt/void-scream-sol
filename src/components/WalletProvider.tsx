'use client';

import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
  children: ReactNode;
}

// Fallback RPC endpoints if Helius fails
const FALLBACK_RPCS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana',
];

export const WalletProvider: FC<Props> = ({ children }) => {
  const [rpcUrl, setRpcUrl] = useState<string>(FALLBACK_RPCS[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch RPC URL from secure API route
    fetch('/api/rpc')
      .then(res => res.json())
      .then(data => {
        if (data.rpc) {
          setRpcUrl(data.rpc);
          console.log('✅ Using Helius RPC');
        }
      })
      .catch(() => {
        console.warn('⚠️ Using fallback RPC');
      })
      .finally(() => setLoading(false));
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <ConnectionProvider 
      endpoint={rpcUrl}
      config={{ 
        commitment: 'confirmed',
        wsEndpoint: undefined
      }}
    >
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};