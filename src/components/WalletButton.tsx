'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, Check } from 'lucide-react';

export const WalletConnectButton = () => {
  return (
    <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !rounded-lg !py-2 !px-4 !text-white !font-medium !text-sm hover:!from-purple-600 hover:!to-pink-600 !transition-all !border-none !shadow-lg" />
  );
};

interface PaymentButtonProps {
  amount: number; // in SOL
  onPaymentSuccess: (signature: string) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  disabled,
  children
}) => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      onPaymentError('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Import Solana web3.js functions
      const { Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      
      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      
      // Create transfer transaction
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });

      // Destination wallet - REPLACE THIS WITH YOUR WALLET ADDRESS
      const destinationAddress = process.env.NEXT_PUBLIC_TREASURY_WALLET || 'YOUR_TREASURY_WALLET_ADDRESS_HERE';
      
      // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: { toBase58: () => destinationAddress } as any,
          lamports,
        })
      );

      // Sign transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        { skipPreflight: true }
      );

      // Confirm transaction
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      setIsSuccess(true);
      onPaymentSuccess(signature);
      
      // Reset success state after 2 seconds
      setTimeout(() => setIsSuccess(false), 2000);
      
    } catch (error: any) {
      console.error('Payment error:', error);
      onPaymentError(error.message || 'Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  }, [publicKey, signTransaction, connection, amount, onPaymentSuccess, onPaymentError]);

  if (!publicKey) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-400 text-center">Connect wallet to continue</p>
        <WalletConnectButton />
      </div>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isProcessing}
      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold"
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : isSuccess ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Success!
        </>
      ) : (
        children
      )}
    </Button>
  );
};
