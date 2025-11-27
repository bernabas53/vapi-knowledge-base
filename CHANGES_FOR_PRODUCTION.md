# Changes Required for Production Setup

## Quick Checklist

### 1. Vercel Environment Variables (Update in Dashboard)
- [ ] `PINECONE_API_KEY` → Production Pinecone API key
- [ ] `PINECONE_INDEX_NAME` → Production Pinecone index name  
- [ ] `VAPI_WEBHOOK_SECRET` → New production webhook secret (optional)

**Location:** https://vercel.com/bernabastewodros-gmailcoms-projects/vapi-knowledge-base/settings/environment-variables

### 2. Local .env File (For Running Scripts)
- [ ] `VAPI_API_KEY` → Production Vapi API key
- [ ] `PINECONE_API_KEY` → Production Pinecone API key
- [ ] `PINECONE_INDEX_NAME` → Production Pinecone index name
- [ ] `KB_SERVER_URL` → **Keep same** (Vercel URL)
- [ ] `VAPI_WEBHOOK_SECRET` → Should match Vercel value

### 3. Pinecone Setup
- [ ] Create/verify production Pinecone index exists
- [ ] Index dimensions: **1536** (for text-embedding-ada-002)
- [ ] Populate index with house listings: `npm run populate`

### 4. Vapi Setup
- [ ] Create new knowledge base: `npm run create-kb`
- [ ] Get production assistant ID
- [ ] Attach knowledge base: `npm run create-kb YOUR_ASSISTANT_ID`

### 5. Testing
- [ ] Test endpoint: `node test-vapi-format.js`
- [ ] Test production assistant
- [ ] Check Vercel logs

---

## What Stays the Same

✅ **Vercel Deployment**
- Same project: `vapi-knowledge-base`
- Same URL: `https://vapi-knowledge-base-d7kgkbcsh.vercel.app/api/kb/search`
- Same code: `api/kb/search.js`

✅ **Code Structure**
- No code changes needed
- Same function handles both accounts via environment variables

✅ **OpenAI API Key** (if using same account)
- Can keep same or update if different

---

## Step-by-Step Instructions

### Step 1: Update Vercel Environment Variables

1. Go to: https://vercel.com/bernabastewodros-gmailcoms-projects/vapi-knowledge-base/settings/environment-variables
2. Click "Edit" on each variable:
   - `PINECONE_API_KEY` → Enter production Pinecone key
   - `PINECONE_INDEX_NAME` → Enter production index name
   - `VAPI_WEBHOOK_SECRET` → Generate new secret (optional)
3. Click "Save"
4. **Redeploy** (Vercel will auto-redeploy or click "Redeploy" button)

### Step 2: Update Local .env

Edit your `.env` file:
```bash
VAPI_API_KEY=your_production_vapi_key
PINECONE_API_KEY=your_production_pinecone_key
PINECONE_INDEX_NAME=your_production_index_name
KB_SERVER_URL=https://vapi-knowledge-base-d7kgkbcsh.vercel.app/api/kb/search
VAPI_WEBHOOK_SECRET=your_production_webhook_secret
OPENAI_API_KEY=your_openai_key
EMBEDDING_MODEL=text-embedding-ada-002
TOP_K_RESULTS=5
```

### Step 3: Populate Production Pinecone

```bash
npm run populate
```

Verify:
```bash
node test-pinecone.js
```

### Step 4: Create Knowledge Base

```bash
npm run create-kb YOUR_PRODUCTION_ASSISTANT_ID
```

### Step 5: Test

```bash
node test-vapi-format.js
```

Then test your production assistant!

---

## Important Notes

1. **Pinecone Index**: Must exist and have 1536 dimensions
2. **Webhook Secret**: Must match between Vercel and Vapi config
3. **Vercel Redeploy**: After updating env vars, wait 1-2 minutes for deployment
4. **Same Deployment**: One Vercel deployment serves both accounts via env vars

