'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, Check, LogOut } from 'lucide-react';

export const WalletConnectButton = () => {
  return (
    <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !rounded-lg !py-2 !px-4 !text-white !font-medium !text-sm hover:!from-purple-600 hover:!to-pink-600 !transition-all !border-none !shadow-lg" />
  );
};

export const WalletDisconnectButton = () => {
  const { disconnect, connected } = useWallet();
  
  if (!connected) return null;
  
  return (
    <Button 
      onClick={disconnect}
      variant="outline"
      className="border-slate-600 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Disconnect
    </Button>
  );
};

interface PaymentButtonProps {
  amount: number;
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
      const { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey, ComputeBudgetProgram } = await import('@solana/web3.js');
      
      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      
      // Create transfer transaction
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });

      // DD's wallet for fee collection
      const destinationAddress = 'DD4AdYKVcV6kgpmiCEeASRmJyRdKgmaRAbsjKucx8CvY';
      
      // Convert SOL to lamports
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      // Add priority fee for faster confirmation
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 5000,
        })
      );

      // Add transfer instruction with PROPER PublicKey
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(destinationAddress),
          lamports,
        })
      );

      // Sign transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        { skipPreflight: false, preflightCommitment: 'confirmed' }
      );

      // Confirm transaction
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

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
