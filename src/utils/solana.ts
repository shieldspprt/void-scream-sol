import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
  TransactionSignature
} from '@solana/web3.js';

/**
 * Creates a connection to the Solana blockchain with optional RPC endpoint
 */
export const createConnection = (rpcEndpoint?: string): Connection => {
  const endpoint = rpcEndpoint || 'https://api.mainnet-beta.solana.com';
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
};

/**
 * Creates a connection with fallback to alternative RPC endpoints
 */
export const createConnectionWithFallback = async (): Promise<Connection> => {
  const rpcEndpoints = [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana',
    'https://mainnet.helius-rpc.com/?api-key=f7b7b1b0-7b7b-4b7b-8b7b-0b7b7b7b7b7b'
  ];

  for (const endpoint of rpcEndpoints) {
    try {
      const connection = createConnection(endpoint);
      await connection.getLatestBlockhash('confirmed');
      console.log(`✅ Connected to Solana via ${endpoint}`);
      return connection;
    } catch (error) {
      console.warn(`❌ Failed to connect to ${endpoint}:`, error);
      continue;
    }
  }

  // Fallback to default if all fail
  console.warn('⚠️ All RPC endpoints failed, using default connection');
  return createConnection();
};

/**
 * Gets the current priority fee to improve transaction success rates
 */
export const getPriorityFee = async (connection: Connection): Promise<number> => {
  try {
    const feeInfo = await connection.getRecentPrioritizationFees();
    if (feeInfo && feeInfo.length > 0) {
      const avgFee = feeInfo.reduce((sum, fee) => sum + fee.prioritizationFee, 0) / feeInfo.length;
      return Math.max(avgFee, 1000); // Minimum 1000 micro-lamports
    }
  } catch (error) {
    console.warn('Failed to get priority fee:', error);
  }
  return 5000; // Default fallback fee
};

/**
 * Validates wallet connection and transaction prerequisites
 */
export const validateTransaction = (
  publicKey: PublicKey | null,
  signTransaction: ((transaction: VersionedTransaction | Transaction) => Promise<VersionedTransaction | Transaction>) | undefined,
  connection: Connection
): { isValid: boolean; error?: string } => {
  if (!publicKey) {
    return { isValid: false, error: "Wallet not connected" };
  }

  if (!signTransaction) {
    return { isValid: false, error: "Wallet does not support transaction signing" };
  }

  if (!connection) {
    return { isValid: false, error: "No connection to Solana network" };
  }

  return { isValid: true };
};

/**
 * Creates a payment transaction for the platform
 * Only handles SOL payment - YLX rewards are processed by backend for security
 */
export const createPaymentTransaction = async (
  publicKey: PublicKey, 
  connection: Connection
): Promise<{ transaction: VersionedTransaction; error?: string }> => {
  const transaction = new Transaction();
  
  try {
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    if (solBalance < 0.01) {
      return { 
        transaction: transaction as any, 
        error: "Insufficient SOL balance. You need at least 0.01 SOL to post." 
      };
    }

    const priorityFee = await getPriorityFee(connection);
    
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: new PublicKey("AEdNLi8aoj9HWgogEEgMyHm9yzisvBcFfWRWVmtCTDK7"),
      lamports: 0.01 * LAMPORTS_PER_SOL,
    });

    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee,
    });

    const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 400_000,
    });

    transaction.add(computeBudgetIx);
    transaction.add(computeLimitIx);
    transaction.add(transferInstruction);

    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = publicKey;

    // Convert to VersionedTransaction
    const message = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: transaction.instructions,
    }).compileToV0Message();

    const versionedTransaction = new VersionedTransaction(message);

    return { transaction: versionedTransaction };
  } catch (error) {
    console.error("Error creating payment transaction:", error);
    return { 
      transaction: transaction as any, 
      error: error instanceof Error ? error.message : "Failed to create transaction" 
    };
  }
};

/**
 * Sends a signed transaction with retry logic and improved error handling
 */
export const sendTransactionWithRetry = async (
  signedTransaction: VersionedTransaction,
  connection: Connection
): Promise<{ signature?: TransactionSignature; error?: string }> => {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Transaction attempt ${attempt}/${maxRetries}`);
      
      // Get fresh blockhash for retry attempts
      if (attempt > 1) {
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        signedTransaction.message.recentBlockhash = latestBlockhash.blockhash;
      }

      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 0,
      });

      console.log(`📡 Transaction sent: ${signature}`);

      // Confirm transaction
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: signedTransaction.message.recentBlockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      console.log(`✅ Transaction confirmed: ${signature}`);
      return { signature };

    } catch (error: any) {
      lastError = error;
      console.warn(`❌ Transaction attempt ${attempt} failed:`, error.message);
      
      // Don't retry certain errors
      if (error.message?.includes('User rejected') || 
          error.message?.includes('insufficient funds') ||
          error.message?.includes('Signature verification failed')) {
        break;
      }
      
      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  return { 
    error: lastError?.message || "Transaction failed after retries" 
  };
};

/**
 * Gets wallet balance with retry logic
 */
export const getWalletBalance = async (
  publicKey: PublicKey,
  connection: Connection
): Promise<{ balance?: number; error?: string }> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return { balance: balance / LAMPORTS_PER_SOL };
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    return { error: 'Failed to check balance' };
  }
};

/**
 * Estimates transaction fee
 */
export const estimateTransactionFee = async (
  transaction: Transaction,
  connection: Connection
): Promise<{ fee?: number; error?: string }> => {
  try {
    const fee = await connection.getFeeForMessage(transaction.compileMessage());
    return { fee: fee ? fee.value / LAMPORTS_PER_SOL : undefined };
  } catch (error) {
    console.error('Failed to estimate transaction fee:', error);
    return { error: 'Failed to estimate fee' };
  }
};