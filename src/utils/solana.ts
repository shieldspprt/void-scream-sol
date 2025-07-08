// Solana blockchain utilities for secure transaction handling
import { 
  Connection, 
  Transaction, 
  SystemProgram, 
  PublicKey, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  TransactionSignature
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { 
  RPC_ENDPOINT, 
  YELLEX_TREASURY_WALLET, 
  POST_PRICE_SOL, 
  TRANSACTION_TIMEOUT_MS,
  MAX_RETRIES 
} from '@/config/constants';

// Create connection with optimized settings for mainnet
export const createConnection = (): Connection => {
  return new Connection(RPC_ENDPOINT, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: TRANSACTION_TIMEOUT_MS,
    wsEndpoint: undefined, // Disable websocket to avoid connection issues
    disableRetryOnRateLimit: false,
    httpHeaders: {
      'Content-Type': 'application/json',
    },
  });
};

// Validate transaction before sending
export const validateTransaction = (
  publicKey: PublicKey | null,
  signTransaction: ((transaction: Transaction) => Promise<Transaction>) | undefined,
  connection: Connection
): { isValid: boolean; error?: string } => {
  if (!publicKey || !signTransaction) {
    return { isValid: false, error: 'Wallet not connected properly' };
  }

  if (!connection) {
    return { isValid: false, error: 'No connection to Solana network' };
  }

  return { isValid: true };
};

// Create payment transaction with proper error handling
export const createPaymentTransaction = async (
  publicKey: PublicKey,
  connection: Connection
): Promise<{ transaction: Transaction; error?: string }> => {
  try {
    const recipientPubkey = new PublicKey(YELLEX_TREASURY_WALLET);
    const lamports = POST_PRICE_SOL * LAMPORTS_PER_SOL;

    // Check wallet balance with retry logic
    const { balance: balanceResult, error: balanceError } = await getWalletBalance(publicKey, connection);
    if (balanceError) {
      throw new Error(`Failed to check balance: ${balanceError}`);
    }
    
    const balance = balanceResult! * LAMPORTS_PER_SOL;
    const requiredBalance = lamports + 10000; // Include fee estimation (10k lamports ~= 0.00001 SOL)
    
    if (balance < requiredBalance) {
      throw new Error(`Insufficient balance. Required: ${requiredBalance / LAMPORTS_PER_SOL} SOL, Available: ${balance / LAMPORTS_PER_SOL} SOL`);
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPubkey,
        lamports,
      })
    );

    // Get recent blockhash with finalized commitment for security
    const latestBlockhash = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = publicKey;

    return { transaction };
  } catch (error: any) {
    return { 
      transaction: new Transaction(), 
      error: error.message || 'Failed to create transaction' 
    };
  }
};

// Send transaction with retry logic and proper error handling
export const sendTransactionWithRetry = async (
  signedTransaction: Transaction,
  connection: Connection
): Promise<{ signature?: TransactionSignature; error?: string }> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 0, // Handle retries manually
        }
      );

      // Wait for confirmation with timeout
      const latestBlockhash = await connection.getLatestBlockhash('finalized');
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, 'finalized');

      return { signature };
    } catch (error: any) {
      lastError = error;
      console.warn(`Transaction attempt ${attempt} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.message?.includes('insufficient funds') || 
          error.message?.includes('blockhash not found')) {
        break;
      }

      // Wait before retry (exponential backoff)
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  return { 
    error: lastError?.message || 'Transaction failed after multiple attempts' 
  };
};

// Get wallet balance safely with retry logic
export const getWalletBalance = async (
  publicKey: PublicKey,
  connection: Connection
): Promise<{ balance?: number; error?: string }> => {
  let lastError: Error | null = null;
  
  // Retry up to 3 times for balance check
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const balance = await connection.getBalance(publicKey, 'confirmed');
      return { balance: balance / LAMPORTS_PER_SOL };
    } catch (error: any) {
      lastError = error;
      console.warn(`Balance check attempt ${attempt} failed:`, error.message);
      
      // Wait before retry (exponential backoff)
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  return { error: lastError?.message || 'Failed to get wallet balance after multiple attempts' };
};

// Estimate transaction fee
export const estimateTransactionFee = async (
  transaction: Transaction,
  connection: Connection
): Promise<{ fee?: number; error?: string }> => {
  try {
    const feeCalculator = await connection.getFeeForMessage(
      transaction.compileMessage(),
      'confirmed'
    );
    
    if (feeCalculator.value === null) {
      throw new Error('Unable to calculate transaction fee');
    }

    return { fee: feeCalculator.value / LAMPORTS_PER_SOL };
  } catch (error: any) {
    return { error: error.message || 'Failed to estimate transaction fee' };
  }
};