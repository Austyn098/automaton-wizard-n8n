
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { voice_input, user_id } = await req.json()
    console.log('Processing voice input:', voice_input)

    // Use OpenAI to parse the voice input into structured product data
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const systemPrompt = `You are a product parser. Convert voice input into JSON format with these exact fields:
{
  "product": "Product Name",
  "slug": "product-slug",
  "price": 5000,
  "description": "Product description"
}

Generate a URL-safe slug from the product name. Price should be in Nigerian Naira. Keep descriptions concise but compelling.`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: voice_input }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const gptResponse = openaiData.choices[0]?.message?.content

    if (!gptResponse) {
      throw new Error('No response from GPT')
    }

    console.log('GPT response:', gptResponse)

    // Parse the JSON response
    let productData
    try {
      productData = JSON.parse(gptResponse)
    } catch (parseError) {
      throw new Error('Failed to parse GPT response as JSON')
    }

    // Validate required fields
    if (!productData.product || !productData.slug || !productData.price || !productData.description) {
      throw new Error('Missing required fields in parsed data')
    }

    // Create the launch record
    const { data: launch, error: launchError } = await supabaseClient
      .from('launches')
      .insert({
        product_name: productData.product,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        prompt: voice_input, // Store original voice input as prompt
        launched_by: user_id || 'voice-user',
        status: 'pending'
      })
      .select()
      .single()

    if (launchError) {
      throw new Error(`Failed to create launch: ${launchError.message}`)
    }

    // Log the voice interaction
    await supabaseClient
      .from('voice_logs')
      .insert({
        user_id: user_id,
        message_text: voice_input,
        response_text: JSON.stringify(productData)
      })

    console.log('Voice deployment created:', launch)

    return new Response(
      JSON.stringify({ 
        success: true,
        launch: launch,
        parsed_data: productData,
        message: `Product "${productData.product}" queued for deployment`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Voice deploy error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
