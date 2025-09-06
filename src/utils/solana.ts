// Solana blockchain utilities for secure transaction handling with latest standards
import { 
  Connection, 
  Transaction, 
  VersionedTransaction,
  TransactionMessage,
  SystemProgram, 
  PublicKey, 
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  TransactionSignature,
  AddressLookupTableAccount
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { 
  RPC_ENDPOINTS,
  RPC_ENDPOINT, 
  YELLEX_TREASURY_WALLET, 
  POST_PRICE_SOL, 
  TRANSACTION_TIMEOUT_MS,
  MAX_RETRIES 
} from '@/config/constants';

// Get custom RPC endpoint from backend
export const getRpcEndpoint = async (): Promise<string> => {
  try {
    const response = await fetch('https://orucuxrquthieojrbyze.supabase.co/functions/v1/get-rpc-endpoint', {
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydWN1eHJxdXRoaWVvanJieXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Nzk1NTMsImV4cCI6MjA2NzM1NTU1M30.3HPL72f6c97V5MhwDsbS2ckh826iq66At36xU6yTNhk`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.rpcEndpoint) {
        console.log('Using custom RPC endpoint from backend');
        return data.rpcEndpoint;
      }
      if (data.fallback) {
        console.log('Using fallback RPC endpoint');
        return data.fallback;
      }
    }
  } catch (error) {
    console.warn('Failed to get custom RPC endpoint, using default:', error);
  }
  
  // Fallback to default
  return RPC_ENDPOINT;
};

// Create connection with RPC fallback logic for better reliability
export const createConnection = (rpcEndpoint?: string): Connection => {
  const endpoint = rpcEndpoint || RPC_ENDPOINT;
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: TRANSACTION_TIMEOUT_MS,
    wsEndpoint: undefined, // Disable websocket to avoid connection issues
    disableRetryOnRateLimit: false,
    httpHeaders: {
      'Content-Type': 'application/json',
    },
  });
};

// Create connection with automatic RPC fallback (now using custom endpoint)
export const createConnectionWithFallback = async (): Promise<Connection> => {
  // First try to get custom RPC endpoint
  try {
    const customRpc = await getRpcEndpoint();
    const connection = createConnection(customRpc);
    // Test the connection by getting latest blockhash
    await connection.getLatestBlockhash('confirmed');
    console.log(`Successfully connected to custom RPC: ${customRpc.replace(/api-key=[^&]+/, 'api-key=***')}`);
    return connection;
  } catch (error) {
    console.warn('Custom RPC failed, trying fallback endpoints...', error);
  }

  // Fallback to hardcoded endpoints
  for (const rpcEndpoint of RPC_ENDPOINTS) {
    try {
      const connection = createConnection(rpcEndpoint);
      // Test the connection by getting latest blockhash
      await connection.getLatestBlockhash('confirmed');
      console.log(`Successfully connected to fallback RPC: ${rpcEndpoint}`);
      return connection;
    } catch (error) {
      console.warn(`RPC ${rpcEndpoint} failed, trying next...`, error);
      continue;
    }
  }
  
  // If all RPCs fail, return default connection as fallback
  console.warn('All RPC endpoints failed, using default connection');
  return createConnection();
};

// Get current priority fee for better transaction success rate
export const getPriorityFee = async (connection: Connection): Promise<number> => {
  try {
    // Get recent priority fees to determine optimal fee
    const fees = await connection.getRecentPrioritizationFees();
    if (fees && fees.length > 0) {
      // Use 75th percentile of recent fees, minimum 1000 microlamports
      const sortedFees = fees.map(f => f.prioritizationFee).sort((a, b) => a - b);
      const percentile75 = sortedFees[Math.floor(sortedFees.length * 0.75)] || 0;
      return Math.max(percentile75, 1000); // Minimum 1000 microlamports
    }
    return 5000; // Default fallback: 5000 microlamports
  } catch (error) {
    console.warn('Failed to get priority fees, using default:', error);
    return 5000; // Fallback priority fee
  }
};

// Validate transaction before sending  
export const validateTransaction = (
  publicKey: PublicKey | null,
  signTransaction: ((transaction: VersionedTransaction | Transaction) => Promise<VersionedTransaction | Transaction>) | undefined,
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

// Create modern versioned transaction with priority fees and compute units
export const createPaymentTransaction = async (
  publicKey: PublicKey,
  connection: Connection
): Promise<{ transaction: VersionedTransaction; error?: string }> => {
  try {
    console.log('💰 Creating payment transaction...', { wallet: publicKey.toString() });
    
    const recipientPubkey = new PublicKey(YELLEX_TREASURY_WALLET);
    const lamports = Math.round(POST_PRICE_SOL * LAMPORTS_PER_SOL);

    console.log('💸 Transaction details:', { 
      recipient: YELLEX_TREASURY_WALLET, 
      amount: POST_PRICE_SOL, 
      lamports 
    });

    // Check wallet balance with retry logic
    console.log('🔍 Checking wallet balance...');
    const { balance: balanceResult, error: balanceError } = await getWalletBalance(publicKey, connection);
    if (balanceError) {
      throw new Error(`Failed to check balance: ${balanceError}`);
    }
    
    const balance = balanceResult! * LAMPORTS_PER_SOL;
    
    // Get dynamic priority fee (microlamports per CU)
    const priorityFee = await getPriorityFee(connection);
    console.log('🚀 Priority fee (microlamports/CU):', priorityFee);
    
    // Estimate total required lamports including priority fees
    const computeUnits = 300000;
    const priorityLamports = Math.ceil((priorityFee * computeUnits) / 1_000_000); // convert microLamports->lamports
    const feeBufferLamports = 5000; // conservative base fee buffer
    const requiredBalance = lamports + feeBufferLamports + priorityLamports;
    
    if (balance < requiredBalance) {
      const requiredSol = requiredBalance / LAMPORTS_PER_SOL;
      const availableSol = balance / LAMPORTS_PER_SOL;
      throw new Error(`Insufficient balance. Required: ${requiredSol} SOL, Available: ${availableSol} SOL`);
    }

    // Get recent blockhash with confirmed commitment for faster processing
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

    // Create instructions with optimized priority fee and compute limit
    const instructions = [
      // Set compute unit limit (simple transfer needs ~300 CU, we set 300000 for safety with complex operations)
      ComputeBudgetProgram.setComputeUnitLimit({
        units: computeUnits,
      }),
      // Set priority fee in microlamports per compute unit (optimized for high success rate)
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityFee,
      }),
      // The actual transfer instruction
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPubkey,
        lamports,
      })
    ];

    // Create versioned transaction with v0 message
    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);

    return { transaction };
  } catch (error: any) {
    console.error('Transaction creation error:', error);
    return { 
      transaction: new VersionedTransaction(new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: '',
        instructions: [],
      }).compileToV0Message()), 
      error: error.message || 'Failed to create transaction' 
    };
  }
};

// Send versioned transaction with retry logic and proper error handling
export const sendTransactionWithRetry = async (
  signedTransaction: VersionedTransaction,
  connection: Connection
): Promise<{ signature?: TransactionSignature; error?: string }> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}: Sending transaction to network...`);
      
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 0, // Handle retries manually
        }
      );
      
      console.log('✅ Transaction sent successfully, signature:', signature);

      // Wait for confirmation with better timeout handling
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, 'confirmed');

      return { signature };
    } catch (error: any) {
      lastError = error;
      console.warn(`Transaction attempt ${attempt} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.message?.includes('insufficient funds') || 
          error.message?.includes('blockhash not found') ||
          error.message?.includes('BlockhashNotFound')) {
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