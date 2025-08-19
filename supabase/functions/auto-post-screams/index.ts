import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting automated scream posting job...');

    // Generate 1-3 random screams
    const screamCount = Math.floor(Math.random() * 3) + 1;
    console.log(`📝 Generating ${screamCount} screams...`);

    // Call the AI generation function
    const generateResponse = await supabase.functions.invoke('generate-hilarious-screams', {
      body: { count: screamCount }
    });

    if (generateResponse.error) {
      console.error('❌ Error generating screams:', generateResponse.error);
      throw new Error(`Failed to generate screams: ${generateResponse.error.message}`);
    }

    const { screams } = generateResponse.data;
    
    if (!screams || screams.length === 0) {
      throw new Error('No screams generated');
    }

    console.log(`✨ Generated ${screams.length} screams, posting to database...`);

    // Get system wallet address
    const { data: systemWallet, error: walletError } = await supabase
      .rpc('get_system_wallet_address');
    
    if (walletError) {
      console.error('❌ Error getting system wallet:', walletError);
      throw new Error('Failed to get system wallet address');
    }

    // Insert screams into database
    const screamInserts = screams.map((scream: any) => ({
      message: scream.message,
      ex_type: scream.ex_type,
      wallet_address: systemWallet,
      action: 'post',
      is_ai_generated: true,
      ai_prompt_category: scream.category,
      has_audio: false,
      likes: Math.floor(Math.random() * 5), // Random initial likes 0-4
      transaction_signature: `AI_GENERATED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ylx_tokens_rewarded: false
    }));

    const { data: insertedScreams, error: insertError } = await supabase
      .from('screams')
      .insert(screamInserts)
      .select();

    if (insertError) {
      console.error('❌ Error inserting screams:', insertError);
      throw new Error(`Failed to insert screams: ${insertError.message}`);
    }

    console.log(`🎉 Successfully posted ${insertedScreams.length} AI screams to the wall!`);

    // Log the posted screams for monitoring
    insertedScreams.forEach((scream: any, index: number) => {
      console.log(`📢 Scream ${index + 1}:`, {
        id: scream.id,
        message: scream.message.substring(0, 100) + (scream.message.length > 100 ? '...' : ''),
        category: scream.ai_prompt_category,
        ex_type: scream.ex_type,
        likes: scream.likes
      });
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully posted ${insertedScreams.length} AI-generated screams`,
      screams: insertedScreams.map(s => ({
        id: s.id,
        message: s.message,
        category: s.ai_prompt_category,
        ex_type: s.ex_type
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in auto-post-screams function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});