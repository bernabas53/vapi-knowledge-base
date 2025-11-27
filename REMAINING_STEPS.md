# Remaining Steps for Production Setup

## ✅ Completed
- [x] Updated local `.env` file with production credentials
  - VAPI_API_KEY: Updated to production account
  - PINECONE_API_KEY: Updated to production Pinecone
  - PINECONE_INDEX_NAME: Updated to production index
- [x] Created knowledge base in production Vapi account
  - Knowledge Base ID: `2325faca-c794-4ac4-933c-92b004ce0730`
  - Server URL: `https://vapi-knowledge-base.vercel.app/api/kb/search`
- [x] Attached knowledge base to production assistant
  - Assistant ID: `22ac0009-6ebb-411e-90e1-ce5bab7e64fc`
  - Assistant Name: `Keyrenter_Boise_DB_VERCEL`
  - Knowledge Base ID: `2325faca-c794-4ac4-933c-92b004ce0730`

## 📋 Remaining Steps

### 1. Update Vercel Environment Variables ⚠️ CRITICAL
**This is the most important step!**

Go to: https://vercel.com/bernabastewodros-gmailcoms-projects/vapi-knowledge-base/settings/environment-variables

Update these variables:
- [ ] `PINECONE_API_KEY` → Your production Pinecone API key
- [ ] `PINECONE_INDEX_NAME` → Your production Pinecone index name
- [ ] `VAPI_WEBHOOK_SECRET` → Should match the one in your `.env` file

**After updating:**
- Wait 1-2 minutes for Vercel to redeploy automatically
- Or manually click "Redeploy" button on the latest deployment

**Why this is critical:**
- The Vercel deployment is currently using your old Pinecone credentials
- Until you update these, the knowledge base will query the wrong Pinecone index
- The endpoint will fail or return wrong data

### 2. Populate Production Pinecone Index
```bash
npm run populate
```

**Verify data:**
```bash
node test-pinecone.js
```

**Important:** Make sure your production Pinecone index:
- Exists and is accessible
- Has **1536 dimensions** (for text-embedding-ada-002)
- Is in the same region as your API key

### 3. Test Everything
```bash
# Test endpoint
node test-vapi-format.js
```

**Expected result:** Should return documents from your production Pinecone index.

### 4. Verify in Production
- Make a test call/chat with your production assistant
- Ask: "What houses are available?" or "Tell me about properties in Salt Lake City"
- Check Vercel function logs: https://vercel.com/bernabastewodros-gmailcoms-projects/vapi-knowledge-base/functions
- Verify knowledge base is returning documents

---

## Quick Checklist Summary

- [x] **Updated local .env** with production credentials
- [x] **Created knowledge base** in production Vapi account
- [x] **Attached knowledge base** to production assistant
- [ ] **Update Vercel env vars** (PINECONE_API_KEY, PINECONE_INDEX_NAME, VAPI_WEBHOOK_SECRET) ⚠️ CRITICAL
- [ ] **Wait for Vercel redeploy** (1-2 minutes)
- [ ] **Populate Pinecone** (`npm run populate`)
- [ ] **Verify Pinecone data** (`node test-pinecone.js`)
- [ ] **Test endpoint** (`node test-vapi-format.js`)
- [ ] **Test production assistant** (make a call)

---

## Current Status

**Knowledge Base:**
- ✅ Created: `2325faca-c794-4ac4-933c-92b004ce0730`
- ✅ Attached to: `22ac0009-6ebb-411e-90e1-ce5bab7e64fc` (Keyrenter_Boise_DB_VERCEL)
- ✅ URL: `https://vapi-knowledge-base.vercel.app/api/kb/search`

**Next Critical Step:**
1. **Update Vercel environment variables** - This is blocking everything!
2. Populate production Pinecone
3. Test

---

## Important Notes

1. **Vercel Environment Variables**: The deployment is still using old Pinecone credentials. Update them NOW or the knowledge base won't work.

2. **Webhook Secret**: Must match between Vercel and Vapi knowledge base config. Check your `.env` file for `VAPI_WEBHOOK_SECRET` and make sure it matches in Vercel.

3. **Pinecone Index**: Must exist and have 1536 dimensions before populating.

4. **Testing**: After updating Vercel env vars, wait 1-2 minutes, then test the endpoint before testing the assistant.
