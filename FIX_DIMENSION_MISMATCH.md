# Fix Dimension Mismatch Error

## Problem
**Error:** `Vector dimension 1536 does not match the dimension of the index 3072`

Your production Pinecone index (`daysaverv1`) has **3072 dimensions** (for `text-embedding-3-large`), but the code was using `text-embedding-ada-002` which produces **1536 dimensions**.

## Solution Applied

### ✅ Code Updated
- `api/kb/search.js` - Changed default model to `text-embedding-3-large`
- `populate-pinecone.js` - Changed default model to `text-embedding-3-large`
- `.env` file - Updated `EMBEDDING_MODEL=text-embedding-3-large`

### ⚠️ CRITICAL: Update Vercel Environment Variable

**You MUST update the Vercel environment variable:**

1. Go to: https://vercel.com/bernabastewodros-gmailcoms-projects/vapi-knowledge-base/settings/environment-variables

2. Find `EMBEDDING_MODEL` variable

3. Click "Edit" and change the value from:
   ```
   text-embedding-ada-002
   ```
   to:
   ```
   text-embedding-3-large
   ```

4. Click "Save"

5. **Wait 1-2 minutes** for Vercel to redeploy

### Verify Fix

After updating Vercel, test the endpoint:
```bash
node verify-production-setup.js
```

Or test directly:
```bash
node test-vapi-format.js
```

## Model Dimensions Reference

| Model | Dimensions | Use Case |
|-------|------------|----------|
| `text-embedding-ada-002` | 1536 | Older, cheaper |
| `text-embedding-3-small` | 1536 | Good balance |
| `text-embedding-3-large` | 3072 | **Best quality** (what you're using) |

## Important Notes

- Your Pinecone index `daysaverv1` is configured for **3072 dimensions**
- You **must** use `text-embedding-3-large` to match
- The code has been updated, but **Vercel needs the env var updated** for the fix to work
- After updating Vercel, the error should be resolved

