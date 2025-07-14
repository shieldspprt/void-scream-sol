// Custom hook for handling yell submissions with proper error handling
import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateMessage, validateExType, validateAudioBlob, sanitizeInput } from '@/utils/validation';
import { validateTransaction, createPaymentWithYlxTransaction, sendTransactionWithRetry, createConnectionWithFallback } from '@/utils/solana';

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
      console.log('🚀 Starting yell submission process...', { action, hasMessage: !!data.message, hasAudio: !!data.audioBlob });
      
      // Process payment for posting to wall
      if (action === 'post') {
        toast({
          title: "💸 Processing payment",
          description: "Creating transaction for 0.01 SOL...",
        });

        // Try with RPC fallback for better reliability
        let workingConnection = connection;
        try {
          // Test current connection first
          await connection.getLatestBlockhash('confirmed');
        } catch (error) {
          console.warn('Current connection failed, trying fallback RPCs...');
          workingConnection = await createConnectionWithFallback();
        }

        // Validate transaction setup
        const transactionValidation = validateTransaction(publicKey, signTransaction, workingConnection);
        if (!transactionValidation.isValid) {
          throw new Error(transactionValidation.error);
        }

        // Create payment transaction with YLX setup
        const { transaction, error: txError } = await createPaymentWithYlxTransaction(
          publicKey,
          workingConnection
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
          workingConnection
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

      // Reward YLX tokens for posts only
      if (action === 'post' && publicKey) {
        try {
          console.log('🎁 Requesting YLX token reward...');
          
          const { data: insertedScream } = await supabase
            .from('screams')
            .select('id')
            .eq('wallet_address', publicKey.toString())
            .eq('transaction_signature', transactionSignature)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (insertedScream) {
            const { data: rewardResult, error: rewardError } = await supabase.functions.invoke(
              'reward-ylx-tokens',
              {
                body: {
                  userWalletAddress: publicKey.toString(),
                  screamId: insertedScream.id,
                  transactionSignature
                }
              }
            );

            if (rewardError) {
              console.warn('YLX reward failed:', rewardError);
              toast({
                title: "⚠️ Token reward pending",
                description: "Your scream was posted but YLX tokens are processing. Contact support if not received.",
                variant: "default"
              });
            } else if (rewardResult?.success) {
              toast({
                title: "🎉 YLX TOKENS REWARDED!",
                description: `Received ${rewardResult.amount || 100} $YLX tokens!`,
                className: "border-neon-green"
              });
            }
          }
        } catch (rewardError) {
          console.warn('YLX reward processing error:', rewardError);
          // Don't fail the main flow for reward errors
        }
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