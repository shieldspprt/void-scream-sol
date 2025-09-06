import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the custom RPC endpoint from Supabase secrets
    const heliusRpcEndpoint = Deno.env.get('HELIUS_RPC_ENDPOINT')
    
    if (!heliusRpcEndpoint) {
      console.error('HELIUS_RPC_ENDPOINT not found in secrets')
      return new Response(
        JSON.stringify({ 
          error: 'RPC endpoint not configured',
          fallback: 'https://api.mainnet-beta.solana.com'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    console.log('Returning RPC endpoint:', heliusRpcEndpoint.replace(/api-key=[^&]+/, 'api-key=***'))

    return new Response(
      JSON.stringify({ rpcEndpoint: heliusRpcEndpoint }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error getting RPC endpoint:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get RPC endpoint',
        fallback: 'https://api.mainnet-beta.solana.com'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})