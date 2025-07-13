import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  Connection, 
  PublicKey, 
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from "https://esm.sh/@solana/web3.js@1.95.2"
import { 
  getOrCreateAssociatedTokenAccount,
  transfer,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "https://esm.sh/@solana/spl-token@0.4.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RewardRequest {
  userWalletAddress: string;
  screamId: string;
  transactionSignature: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎁 Starting YLX token reward distribution...');
    
    // Parse request body
    const { userWalletAddress, screamId, transactionSignature }: RewardRequest = await req.json();
    
    if (!userWalletAddress || !screamId || !transactionSignature) {
      throw new Error('Missing required parameters');
    }

    // Get environment variables
    const YELLEX_PRIVATE_KEY = Deno.env.get('YELLEX_PRIVATE_KEY');
    const YLX_TOKEN_MINT = Deno.env.get('YLX_TOKEN_MINT');
    const YLX_TOKEN_DECIMALS = parseInt(Deno.env.get('YLX_TOKEN_DECIMALS') || '6');
    const YLX_REWARD_AMOUNT = parseInt(Deno.env.get('YLX_REWARD_AMOUNT') || '100');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!YELLEX_PRIVATE_KEY || !YLX_TOKEN_MINT || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify the scream exists and hasn't already been rewarded
    const { data: scream, error: screamError } = await supabase
      .from('screams')
      .select('id, wallet_address, transaction_signature, ylx_tokens_rewarded')
      .eq('id', screamId)
      .eq('wallet_address', userWalletAddress)
      .eq('transaction_signature', transactionSignature)
      .single();

    if (screamError || !scream) {
      throw new Error('Invalid scream or verification failed');
    }

    if (scream.ylx_tokens_rewarded) {
      console.log('⚠️ Tokens already rewarded for this scream');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Tokens already rewarded',
          alreadyRewarded: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Solana connection
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Create Yellex wallet keypair from private key
    const yellexKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(YELLEX_PRIVATE_KEY))
    );
    
    console.log(`💰 Yellex wallet: ${yellexKeypair.publicKey.toString()}`);

    // Create user wallet public key
    const userWallet = new PublicKey(userWalletAddress);
    const ylxMint = new PublicKey(YLX_TOKEN_MINT);

    console.log(`👤 User wallet: ${userWallet.toString()}`);
    console.log(`🪙 YLX mint: ${ylxMint.toString()}`);

    // Get or create Yellex associated token account
    const yellexTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      yellexKeypair,
      ylxMint,
      yellexKeypair.publicKey
    );

    console.log(`🏦 Yellex token account: ${yellexTokenAccount.address.toString()}`);

    // Get or create user associated token account
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      yellexKeypair, // Yellex pays for account creation if needed
      ylxMint,
      userWallet
    );

    console.log(`👛 User token account: ${userTokenAccount.address.toString()}`);

    // Calculate token amount with decimals
    const tokenAmount = YLX_REWARD_AMOUNT * Math.pow(10, YLX_TOKEN_DECIMALS);
    
    console.log(`🎁 Transferring ${YLX_REWARD_AMOUNT} YLX (${tokenAmount} with decimals)`);

    // Create and send token transfer transaction
    const transferTx = await transfer(
      connection,
      yellexKeypair,
      yellexTokenAccount.address,
      userTokenAccount.address,
      yellexKeypair,
      tokenAmount
    );

    console.log(`✅ Token transfer completed: ${transferTx}`);

    // Update database to mark tokens as rewarded
    const { error: updateError } = await supabase
      .from('screams')
      .update({ 
        ylx_tokens_rewarded: true,
        ylx_reward_signature: transferTx
      })
      .eq('id', screamId);

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      // Don't throw here as tokens were already transferred
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully rewarded ${YLX_REWARD_AMOUNT} $YLX tokens!`,
        tokenTransferSignature: transferTx,
        amount: YLX_REWARD_AMOUNT
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Token reward error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to distribute YLX tokens'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});