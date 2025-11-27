# Production Setup Checklist

## Overview
Setting up the knowledge base for your **production Vapi account** with a **different Pinecone account**, using the **same Vercel deployment**.

## What Changes vs What Stays the Same

### ✅ Stays the Same (Vercel Deployment)
- Vercel project: `vapi-knowledge-base`
- Deployment URL: `https://vapi-knowledge-base-d7kgkbcsh.vercel.app/api/kb/search`
- Code structure: `api/kb/search.js`
- Vercel account: Same

### 🔄 Needs to Change

1. **Vapi Account** (Production)
2. **Pinecone Account** (Different account)
3. **Environment Variables** (In Vercel)
4. **Knowledge Base** (Create new one)
5. **Assistant** (Production assistant ID)

---

## Step-by-Step Setup

### Step 1: Update Vercel Environment Variables

Go to: https://vercel.com/bernabastewodros-gmailcoms-projects/vapi-knowledge-base/settings/environment-variables

**Update these variables:**

1. **PINECONE_API_KEY**
   - Old: Current Pinecone API key
   - New: Your production Pinecone API key
   - Action: Click edit → Update value → Save

2. **PINECONE_INDEX_NAME**
   - Old: `newnew1536` (or current index name)
   - New: Your production Pinecone index name
   - ⚠️ **Important**: Make sure the index exists and has the correct dimensions (1536 for text-embedding-ada-002)
   - Action: Click edit → Update value → Save

3. **VAPI_WEBHOOK_SECRET** (Optional but recommended)
   - Old: Current webhook secret
   - New: Generate a new one for production
   - Action: Generate new secret → Update value → Save

**Keep these the same:**
- `OPENAI_API_KEY` (if using same OpenAI account)
- `EMBEDDING_MODEL` (should stay `text-embedding-ada-002`)
- `TOP_K_RESULTS` (can keep as `5`)

### Step 2: Populate Production Pinecone Index

**Before running, update your `.env` file locally:**

```bash
# Update these in your local .env
PINECONE_API_KEY=your_production_pinecone_key
PINECONE_INDEX_NAME=your_production_index_name
```

**Then populate Pinecone:**

```bash
npm run populate
```

**Verify data is in Pinecone:**
```bash
node test-pinecone.js
```

### Step 3: Create Knowledge Base in Production Vapi Account

**Update your `.env` file:**

```bash
# Production Vapi account
VAPI_API_KEY=your_production_vapi_api_key
KB_SERVER_URL=https://vapi-knowledge-base-d7kgkbcsh.vercel.app/api/kb/search
VAPI_WEBHOOK_SECRET=your_production_webhook_secret  # Should match Vercel
```

**Create knowledge base:**

```bash
npm run create-kb
```

**Note the Knowledge Base ID** - you'll need it for the next step.

### Step 4: Attach to Production Assistant

**Get your production assistant ID** from Vapi dashboard.

**Attach knowledge base:**

```bash
npm run create-kb YOUR_PRODUCTION_ASSISTANT_ID
```

Replace `YOUR_PRODUCTION_ASSISTANT_ID` with your actual production assistant ID.

### Step 5: Verify Everything

**Test the endpoint:**
```bash
node test-vapi-format.js
```

**Test your production assistant:**
- Make a call/chat
- Ask: "What houses are available in Salt Lake City?"
- Check Vercel logs to verify it's working

---

## Quick Reference: Environment Variables

### Vercel Environment Variables (Update These)
```
PINECONE_API_KEY=production_pinecone_key
PINECONE_INDEX_NAME=production_index_name
VAPI_WEBHOOK_SECRET=production_webhook_secret (optional, but recommended)
```

### Local .env File (For Scripts)
```
VAPI_API_KEY=production_vapi_key
PINECONE_API_KEY=production_pinecone_key
PINECONE_INDEX_NAME=production_index_name
KB_SERVER_URL=https://vapi-knowledge-base-d7kgkbcsh.vercel.app/api/kb/search
VAPI_WEBHOOK_SECRET=production_webhook_secret
OPENAI_API_KEY=your_openai_key
EMBEDDING_MODEL=text-embedding-ada-002
TOP_K_RESULTS=5
```

---

## Important Notes

1. **Pinecone Index Dimensions**
   - Must match embedding model dimensions
   - `text-embedding-ada-002` = 1536 dimensions
   - Verify your production index has correct dimensions

2. **Webhook Secret**
   - Must match between Vercel and Vapi knowledge base config
   - Generate a new one for production security

3. **Data Population**
   - Run `npm run populate` after updating Pinecone credentials
   - Verify data exists before testing assistant

4. **Vercel Deployment**
   - Same deployment serves both accounts
   - Environment variables determine which Pinecone to use
   - No code changes needed

5. **Testing**
   - Test endpoint first: `node test-vapi-format.js`
   - Then test assistant with real call
   - Check Vercel logs for any issues

---

## Troubleshooting

**If knowledge base doesn't work:**
1. Check Vercel environment variables are updated
2. Verify Pinecone index has data
3. Check knowledge base is attached to assistant
4. Check Vercel function logs for errors

**If Pinecone connection fails:**
1. Verify API key is correct
2. Check index name matches
3. Verify index dimensions are correct (1536)
4. Check Pinecone dashboard for index status

---

## Summary Checklist

- [ ] Update Vercel environment variables (Pinecone API key, index name)
- [ ] Update local `.env` file with production credentials
- [ ] Populate production Pinecone index (`npm run populate`)
- [ ] Verify Pinecone data (`node test-pinecone.js`)
- [ ] Create knowledge base in production Vapi account (`npm run create-kb`)
- [ ] Attach to production assistant (`npm run create-kb ASSISTANT_ID`)
- [ ] Test endpoint (`node test-vapi-format.js`)
- [ ] Test production assistant with real call
- [ ] Verify Vercel logs show successful requests

