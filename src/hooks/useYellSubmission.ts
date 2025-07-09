// Custom hook for handling yell submissions with proper error handling
import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateMessage, validateExType, validateAudioBlob, sanitizeInput } from '@/utils/validation';
import { validateTransaction, createPaymentTransaction, sendTransactionWithRetry } from '@/utils/solana';

export interface YellSubmissionData {
  message: string;
  exType: string;
  audioBlob: Blob | null;
}

export const useYellSubmission = () => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitYell = async (action: 'burn' | 'post', data: YellSubmissionData): Promise<{ success: boolean; transactionSignature?: string }> => {
    if (!publicKey || !signTransaction) {
      toast({
        title: "❌ Wallet not connected",
        description: "Connect your wallet to unleash your rage!",
        variant: "destructive"
      });
      return { success: false };
    }

    // Validate inputs
    const hasContent = data.message.trim() || data.audioBlob;
    if (!hasContent) {
      toast({
        title: "❌ Empty scream",
        description: "You need to write something or record audio first!",
        variant: "destructive"
      });
      return { success: false };
    }

    // Validate message if provided
    if (data.message.trim()) {
      const messageValidation = validateMessage(data.message);
      if (!messageValidation.isValid) {
        toast({
          title: "❌ Invalid message",
          description: messageValidation.error,
          variant: "destructive"
        });
        return { success: false };
      }
    }

    // Validate ex type
    const exTypeValidation = validateExType(data.exType);
    if (!exTypeValidation.isValid) {
      toast({
        title: "❌ Ex type required",
        description: exTypeValidation.error,
        variant: "destructive"
      });
      return { success: false };
    }

    // Validate audio if provided
    if (data.audioBlob) {
      const audioValidation = validateAudioBlob(data.audioBlob);
      if (!audioValidation.isValid) {
        toast({
          title: "❌ Invalid audio",
          description: audioValidation.error,
          variant: "destructive"
        });
        return { success: false };
      }
    }

    setIsSubmitting(true);
    let transactionSignature = null;

    try {
      // Process payment for posting to wall
      if (action === 'post') {
        // Validate transaction setup
        const transactionValidation = validateTransaction(publicKey, signTransaction, connection);
        if (!transactionValidation.isValid) {
          throw new Error(transactionValidation.error);
        }

        toast({
          title: "💸 Processing payment",
          description: "Creating transaction for 0.01 SOL...",
        });

        // Create payment transaction
        const { transaction, error: txError } = await createPaymentTransaction(
          publicKey,
          connection
        );

        if (txError) {
          throw new Error(txError);
        }

        // Sign versioned transaction
        const signedTransaction = await signTransaction(transaction) as VersionedTransaction;

        toast({
          title: "📡 Sending transaction",
          description: "Broadcasting to Solana network...",
        });

        // Send with retry logic
        const { signature, error: sendError } = await sendTransactionWithRetry(
          signedTransaction,
          connection
        );

        if (sendError) {
          throw new Error(sendError);
        }

        transactionSignature = signature!;
        
        toast({
          title: "✅ Payment confirmed",
          description: "Transaction confirmed on blockchain!",
        });
      }

      // Process audio data
      let audioData = null;
      if (data.audioBlob) {
        try {
          const reader = new FileReader();
          audioData = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const result = reader.result?.toString();
              if (result) {
                resolve(result.split(',')[1]);
              } else {
                reject(new Error('Failed to process audio'));
              }
            };
            reader.onerror = () => reject(new Error('File read error'));
            reader.readAsDataURL(data.audioBlob!);
          });
        } catch (error) {
          throw new Error('Failed to process audio file');
        }
      }

      // Sanitize and save to database
      const sanitizedMessage = data.message ? sanitizeInput(data.message) : null;
      const sanitizedExType = sanitizeInput(data.exType);

      const { error: dbError } = await supabase
        .from('screams')
        .insert({
          message: sanitizedMessage,
          ex_type: sanitizedExType,
          has_audio: !!data.audioBlob,
          audio_data: audioData,
          action,
          wallet_address: publicKey.toString(),
          transaction_signature: transactionSignature
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save to database');
      }

      // Success notifications
      if (action === 'burn') {
        toast({
          title: "🔥 BURNED FOREVER!",
          description: "Your scream has been sent to the void. It's gone forever, just like your ex should be.",
          className: "border-destructive"
        });
      } else {
        toast({
          title: "📢 Posted to Wall of Screams!",
          description: "Your anonymous rage is now public and payment confirmed!",
          className: "border-neon-cyan"
        });
      }

      return { success: true, transactionSignature };

    } catch (error: any) {
      console.error('Submission error:', error);
      
      let errorMessage = "Something went wrong. Your rage remains trapped!";
      
      // Provide specific error messages for common mainnet issues
      if (error.message?.includes('403') || error.message?.includes('Access forbidden')) {
        errorMessage = "Network temporarily unavailable. Please try again in a moment.";
      } else if (error.message?.includes('insufficient funds') || error.message?.includes('Insufficient balance')) {
        errorMessage = "Insufficient SOL balance for transaction fees.";
      } else if (error.message?.includes('User rejected')) {
        errorMessage = "Transaction was cancelled by user.";
      } else if (error.message?.includes('blockhash')) {
        errorMessage = "Network congestion. Please try again.";
      } else if (error.message?.includes('Failed to check balance')) {
        errorMessage = "Unable to verify wallet balance. Check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "❌ Submission failed",
        description: errorMessage,
        variant: "destructive"
      });

      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitYell,
    isSubmitting
  };
};