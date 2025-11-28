# Setup Guide for Your Coworker

## Quick Start: Setting Up Your Own Vapi + Pinecone Knowledge Base

Follow these steps to deploy your own instance using the code from this repository.

## Prerequisites

Before starting, make sure you have:
- ✅ Node.js (v16 or higher) installed
- ✅ A GitHub account
- ✅ A Vercel account (free tier works)
- ✅ A Vapi account and API key
- ✅ A Pinecone account and API key
- ✅ An OpenAI API key

## Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/bernabas53/vapi-knowledge-base.git
cd vapi-knowledge-base
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Your Pinecone Index

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index with:
   - **Name**: Your choice (e.g., `my-knowledge-base`)
   - **Dimensions**: `3072` (for `text-embedding-3-large`)
   - **Metric**: `cosine`
3. **Note the index name** - you'll need it later

### Step 4: Set Up Environment Variables Locally

```bash
cp env.example .env
```

Edit `.env` file with your credentials:

```bash
# Vapi Configuration
VAPI_API_KEY=your_vapi_api_key_here
KB_SERVER_URL=https://your-project.vercel.app/api/kb/search  # Will update after deployment
VAPI_WEBHOOK_SECRET=your_random_secret_here  # Generate a random string

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your_index_name_here  # The name you created in Step 3

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_MODEL=text-embedding-3-large

# Server Configuration
TOP_K_RESULTS=5
```

### Step 5: Populate Your Pinecone Index

**Important:** You need your own data file. Replace `House Listings.txt` with your data, or modify `populate-pinecone.js` to read from your data source.

Then run:
```bash
npm run populate
```

Verify data was uploaded:
```bash
node test-pinecone.js
```

### Step 6: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository (or upload the code)
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - Click "Deploy"

#### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 7: Set Environment Variables in Vercel

**CRITICAL STEP** - This is where most people get stuck!

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add each variable one by one:

   **Variable 1:**
   - Name: `PINECONE_API_KEY`
   - Value: Your Pinecone API key
   - Environment: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

   **Variable 2:**
   - Name: `PINECONE_INDEX_NAME`
   - Value: Your Pinecone index name (from Step 3)
   - Environment: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

   **Variable 3:**
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
   - Environment: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

   **Variable 4:**
   - Name: `EMBEDDING_MODEL`
   - Value: `text-embedding-3-large`
   - Environment: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

   **Variable 5:**
   - Name: `TOP_K_RESULTS`
   - Value: `5`
   - Environment: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

   **Variable 6:**
   - Name: `VAPI_WEBHOOK_SECRET`
   - Value: Same secret you used in `.env` file
   - Environment: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

3. **After adding all variables**, go to **Deployments** tab
4. Click "..." on latest deployment → **"Redeploy"**
5. Wait 2-3 minutes for redeploy to complete

### Step 8: Update KB_SERVER_URL

1. Get your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
2. Update your local `.env` file:
   ```
   KB_SERVER_URL=https://your-project.vercel.app/api/kb/search
   ```

### Step 9: Create Knowledge Base and Attach to Assistant

1. Get your Vapi Assistant ID from Vapi dashboard
2. Run:
   ```bash
   npm run create-kb YOUR_ASSISTANT_ID
   ```
   Replace `YOUR_ASSISTANT_ID` with your actual assistant ID

### Step 10: Test Everything

```bash
# Test Pinecone connection
node test-pinecone.js

# Test endpoint
node test-vapi-format.js

# Test your assistant
# Make a call/chat and ask a question
```

## Common Issues & Solutions

### Issue: 500 Error in Vercel Logs
**Solution:** Check that ALL environment variables are set in Vercel Dashboard → Settings → Environment Variables

### Issue: "PineconeConfigurationError: apiKey missing"
**Solution:** `PINECONE_API_KEY` is not set in Vercel. Add it in Environment Variables.

### Issue: "Vector dimension mismatch"
**Solution:** Make sure your Pinecone index has **3072 dimensions** and `EMBEDDING_MODEL` is set to `text-embedding-3-large`

### Issue: Empty documents returned
**Solution:** 
1. Verify Pinecone index has data (`npm run populate`)
2. Check `PINECONE_INDEX_NAME` matches your actual index name
3. Check Vercel logs for errors

## Verification Checklist

- [ ] Pinecone index created with 3072 dimensions
- [ ] Data populated in Pinecone (`npm run populate`)
- [ ] Deployed to Vercel
- [ ] All 6 environment variables set in Vercel
- [ ] Redeployed after adding environment variables
- [ ] Knowledge base created in Vapi
- [ ] Knowledge base attached to assistant
- [ ] Test endpoint returns documents
- [ ] Assistant can answer questions using knowledge base

## Need Help?

1. Check Vercel function logs: Dashboard → Functions → `api/kb/search.js` → Logs
2. Verify environment variables are set correctly
3. Test locally first before deploying
4. Check that Pinecone index has data

## Summary

The key steps are:
1. Clone repo → Install dependencies
2. Create Pinecone index (3072 dimensions)
3. Populate Pinecone with your data
4. Deploy to Vercel
5. **Set environment variables in Vercel** (most important!)
6. Redeploy
7. Create knowledge base and attach to assistant
8. Test!

Good luck! 🚀

