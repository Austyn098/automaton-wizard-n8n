
# ODIAAA Automated Deployment Setup

## Required Environment Variables

### Supabase Edge Functions
```bash
# In Supabase Dashboard -> Settings -> Edge Functions
SUPABASE_URL=https://jequlpvidimqlygeoxmd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
N8N_WEBHOOK_SECRET=your-secret-key
OPENAI_API_KEY=your_openai_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Vercel Environment Variables (for product template)
```bash
PRODUCT_NAME=Dynamic Product Name
PRODUCT_DESCRIPTION=Dynamic Description
PRODUCT_PRICE=Dynamic Price
PRODUCT_SLUG=Dynamic Slug
SUPABASE_URL=https://jequlpvidimqlygeoxmd.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

### n8n Workflow Configuration
1. Import the workflow from `n8n-workflows/odiaaa-deployment-workflow.json`
2. Configure Vercel API credentials in n8n
3. Set the webhook secret to match `N8N_WEBHOOK_SECRET`
4. Update repository reference to your product template repo

## Webhook URLs
- **n8n Deployment Webhook**: `https://odia.app.n8n.cloud/webhook/deploy-product`
- **Supabase Deployment Status**: `https://jequlpvidimqlygeoxmd.supabase.co/functions/v1/deployment-webhook`
- **Voice Deploy**: `https://jequlpvidimqlygeoxmd.supabase.co/functions/v1/voice-deploy`
- **Launch Product**: `https://jequlpvidimqlygeoxmd.supabase.co/functions/v1/launch-product`

## Testing Flow
1. **Create Launch**: POST to `/launch` with product details
2. **Trigger Deploy**: Automatically calls n8n webhook
3. **n8n Processes**: Deploys to Vercel with dynamic env vars
4. **Status Update**: Vercel webhook updates Supabase
5. **WhatsApp Alert**: Admin receives deployment status

## Database Triggers (Optional)
```sql
-- Auto-trigger deployment on insert
CREATE OR REPLACE FUNCTION trigger_deployment()
RETURNS TRIGGER AS $$
BEGIN
  -- Call edge function to start deployment
  PERFORM net.http_post(
    url := 'https://jequlpvidimqlygeoxmd.supabase.co/functions/v1/launch-product',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'launch_id', NEW.id,
      'auto_trigger', true
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_deploy_trigger
  AFTER INSERT ON public.launches
  FOR EACH ROW
  EXECUTE FUNCTION trigger_deployment();
```

## Security Checklist
- ✅ Webhook secret verification
- ✅ RLS policies on all tables
- ✅ Service role key in edge functions only
- ✅ Twilio credentials secured
- ✅ CORS headers configured
- ✅ Input validation and sanitization

## Monitoring
- Real-time updates via Supabase subscriptions
- WhatsApp notifications for all deployments
- Complete audit trail in `workflow_executions` table
- Error logging in `notifications` table
