# Disable Vercel Deployment Protection

Your Vercel deployment has protection enabled which is blocking Vapi's requests. Here's how to disable it:

## Option 1: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/bernabastewodros-gmailcoms-projects/vapi-knowledge-base/settings/deployment-protection
2. Click "Disable Protection" or set it to "No Protection"
3. Save changes

## Option 2: Via Vercel CLI

```bash
vercel project update vapi-knowledge-base --protection-bypass-secret ""
```

However, the easiest way is through the dashboard.

## After Disabling Protection

Once protection is disabled, Vapi will be able to call your endpoint. Test again with your assistant.

