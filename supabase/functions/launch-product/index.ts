
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

    const { launch_id, manual } = await req.json()
    
    console.log('Processing launch:', { launch_id, manual })

    // Get launch details
    const { data: launch, error: launchError } = await supabaseClient
      .from('launches')
      .select('*')
      .eq('id', launch_id)
      .single()

    if (launchError || !launch) {
      throw new Error(`Launch not found: ${launchError?.message}`)
    }

    // Create deployment record
    const { data: deployment, error: deploymentError } = await supabaseClient
      .from('deployments')
      .insert({
        launch_id: launch.id,
        status: 'deploying'
      })
      .select()
      .single()

    if (deploymentError) {
      throw new Error(`Failed to create deployment: ${deploymentError.message}`)
    }

    // Trigger n8n workflow for deployment
    const n8nWebhookUrl = 'https://odia.app.n8n.cloud/webhook/deploy-product'
    
    const n8nPayload = {
      launch_id: launch.id,
      deployment_id: deployment.id,
      product_name: launch.product_name,
      slug: launch.slug,
      description: launch.description,
      price: launch.price,
      prompt: launch.prompt
    }

    console.log('Triggering n8n workflow:', n8nPayload)

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-SECRET': Deno.env.get('N8N_WEBHOOK_SECRET') || 'your-secret-key'
      },
      body: JSON.stringify(n8nPayload)
    })

    if (!n8nResponse.ok) {
      throw new Error(`n8n webhook failed: ${n8nResponse.status}`)
    }

    // Update launch status
    await supabaseClient
      .from('launches')
      .update({ 
        status: 'deploying',
        updated_at: new Date().toISOString()
      })
      .eq('id', launch.id)

    // Log workflow execution
    await supabaseClient
      .from('workflow_executions')
      .insert({
        launch_id: launch.id,
        workflow_id: 'deploy-product',
        status: 'running',
        webhook_url: n8nWebhookUrl
      })

    // Send admin notification
    const adminPhone = '+2348012345678' // Replace with actual admin number
    
    await supabaseClient
      .from('notifications')
      .insert({
        launch_id: launch.id,
        type: 'whatsapp',
        recipient: adminPhone,
        message: `🚀 Deployment started for "${launch.product_name}" (${launch.slug}). Status: In Progress`
      })

    console.log('Launch process initiated successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Launch process initiated',
        deployment_id: deployment.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Launch error:', error)
    
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
