# Quick Setup Guide for Your Coworker

## Prerequisites
- Node.js (v16 or higher)
- Git
- Accounts: Vapi, Pinecone, OpenAI
- A hosting platform (Vercel recommended, but any works)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/bernabas53/vapi-knowledge-base.git
cd vapi-knowledge-base
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
cp env.example .env
```

Edit `.env` with your credentials:
- `VAPI_API_KEY` - Your Vapi API key
- `PINECONE_API_KEY` - Your Pinecone API key
- `PINECONE_INDEX_NAME` - Your Pinecone index name
- `OPENAI_API_KEY` - Your OpenAI API key
- `KB_SERVER_URL` - Will be set after deployment
- `VAPI_WEBHOOK_SECRET` - Generate a random secret
- `EMBEDDING_MODEL` - `text-embedding-3-large` (for 3072 dimensions)

### 4. Create Pinecone Index
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create index with:
   - **Dimensions**: `3072` (for text-embedding-3-large)
   - **Metric**: `cosine`

### 5. Populate Pinecone
```bash
npm run populate
```

### 6. Deploy to Vercel (or your hosting platform)

**Option A: Vercel (Recommended)**
```bash
npm i -g vercel
vercel login
vercel link
vercel --prod
```

Then set environment variables in Vercel dashboard:
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `OPENAI_API_KEY`
- `EMBEDDING_MODEL` = `text-embedding-3-large`
- `VAPI_WEBHOOK_SECRET`
- `TOP_K_RESULTS` = `5`

**Option B: Other Platforms**
- See `WHY_VERCEL_NOT_REQUIRED.md` for alternatives
- Use `server.js` for traditional server deployments

### 7. Update KB_SERVER_URL
After deployment, update `.env`:
```
KB_SERVER_URL=https://your-deployment-url.vercel.app/api/kb/search
```

### 8. Create Knowledge Base
```bash
npm run create-kb YOUR_ASSISTANT_ID
```

Replace `YOUR_ASSISTANT_ID` with your Vapi assistant ID.

### 9. Test
```bash
node verify-production-setup.js
```

## Important Notes

1. **Dimension Mismatch**: Make sure your Pinecone index has **3072 dimensions** to match `text-embedding-3-large`

2. **Environment Variables**: All sensitive keys should be in `.env` (not committed to Git)

3. **Vercel Deployment**: After updating environment variables in Vercel, wait 1-2 minutes for redeploy

4. **Testing**: Use `node test-vapi-format.js` to test the endpoint

## Documentation Files

- `README.md` - Main setup guide
- `PRODUCTION_SETUP.md` - Detailed production setup
- `CHANGES_FOR_PRODUCTION.md` - Production checklist
- `FIX_DIMENSION_MISMATCH.md` - Troubleshooting dimension issues
- `WHY_VERCEL_NOT_REQUIRED.md` - Alternative hosting options

## Troubleshooting

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables are set correctly
3. Ensure Pinecone index dimensions match embedding model (3072)
4. Test endpoint: `node test-vapi-format.js`

## Support

For issues, check:
- Vercel function logs
- Pinecone index stats
- Vapi assistant configuration

