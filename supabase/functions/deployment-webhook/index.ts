
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-vercel-signature',
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

    const payload = await req.json()
    console.log('Deployment webhook received:', payload)

    const { 
      deployment_id, 
      launch_id, 
      status, 
      deployment_url, 
      error_details,
      vercel_deployment_id 
    } = payload

    // Update deployment status
    const { error: deploymentError } = await supabaseClient
      .from('deployments')
      .update({
        status: status,
        deployment_url: deployment_url,
        error_details: error_details,
        completed_at: new Date().toISOString()
      })
      .eq('id', deployment_id)

    if (deploymentError) {
      throw new Error(`Failed to update deployment: ${deploymentError.message}`)
    }

    // Update launch status and subdomain URL
    const launchUpdate: any = { 
      status: status === 'success' ? 'live' : 'failed',
      deployed: status === 'success',
      updated_at: new Date().toISOString()
    }

    if (status === 'success' && deployment_url) {
      launchUpdate.subdomain_url = deployment_url
    }

    if (error_details) {
      launchUpdate.error_message = error_details
    }

    await supabaseClient
      .from('launches')
      .update(launchUpdate)
      .eq('id', launch_id)

    // Get launch details for notification
    const { data: launch } = await supabaseClient
      .from('launches')
      .select('product_name, slug')
      .eq('id', launch_id)
      .single()

    // Send WhatsApp notification
    const adminPhone = '+2348012345678' // Replace with actual admin number
    
    let message = ''
    if (status === 'success') {
      message = `✅ SUCCESS: "${launch?.product_name}" (${launch?.slug}) deployed successfully!\n🔗 ${deployment_url}`
    } else {
      message = `❌ FAILED: "${launch?.product_name}" (${launch?.slug}) deployment failed.\n💡 ${error_details || 'Check logs for details'}`
    }

    // Insert notification record
    await supabaseClient
      .from('notifications')
      .insert({
        launch_id: launch_id,
        type: 'whatsapp',
        recipient: adminPhone,
        message: message
      })

    // Send actual WhatsApp message via Twilio (if configured)
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER') || 'whatsapp:+14155238886'

    if (twilioSid && twilioToken) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`
        
        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: twilioWhatsAppNumber,
            To: `whatsapp:${adminPhone}`,
            Body: message
          })
        })

        if (twilioResponse.ok) {
          console.log('WhatsApp notification sent successfully')
          // Update notification status
          await supabaseClient
            .from('notifications')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('launch_id', launch_id)
            .eq('type', 'whatsapp')
            .order('created_at', { ascending: false })
            .limit(1)
        } else {
          throw new Error(`Twilio error: ${twilioResponse.status}`)
        }
      } catch (twilioError) {
        console.error('WhatsApp notification failed:', twilioError)
        await supabaseClient
          .from('notifications')
          .update({ 
            status: 'failed',
            error_message: twilioError.message
          })
          .eq('launch_id', launch_id)
          .eq('type', 'whatsapp')
          .order('created_at', { ascending: false })
          .limit(1)
      }
    }

    // Log workflow completion
    await supabaseClient
      .from('workflow_executions')
      .update({
        status: status === 'success' ? 'success' : 'failed',
        completed_at: new Date().toISOString(),
        response_data: payload,
        error_details: error_details
      })
      .eq('launch_id', launch_id)
      .eq('workflow_id', 'deploy-product')

    console.log('Deployment webhook processed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Deployment status updated',
        status: status
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Deployment webhook error:', error)
    
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
