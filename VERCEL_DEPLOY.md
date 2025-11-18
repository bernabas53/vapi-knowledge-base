# Deploying to Vercel

This guide will walk you through deploying your custom knowledge base server to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Vercel CLI installed (optional, but recommended)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect it's a Node.js project

3. **Configure Environment Variables**
   In the Vercel dashboard, go to your project → Settings → Environment Variables and add:
   
   - `PINECONE_API_KEY` - Your Pinecone API key
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `VAPI_WEBHOOK_SECRET` - Your webhook secret (same as in .env)
   - `PINECONE_INDEX_NAME` - Your Pinecone index name (default: `vapi-knowledge-base`)
   - `EMBEDDING_MODEL` - Embedding model (default: `text-embedding-ada-002`)
   - `TOP_K_RESULTS` - Number of results (default: `5`)

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

5. **Get Your Server URL**
   - After deployment, Vercel will give you a URL like: `https://your-project.vercel.app`
   - Your knowledge base endpoint will be: `https://your-project.vercel.app/api/kb/search`
   - **Copy this URL** - you'll need it for `KB_SERVER_URL`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? No (first time)
   - Project name? (press enter for default)
   - Directory? `./` (press enter)
   - Override settings? No (press enter)

4. **Set Environment Variables**
   ```bash
   vercel env add PINECONE_API_KEY
   vercel env add OPENAI_API_KEY
   vercel env add VAPI_WEBHOOK_SECRET
   vercel env add PINECONE_INDEX_NAME
   vercel env add EMBEDDING_MODEL
   vercel env add TOP_K_RESULTS
   ```
   
   Enter the values when prompted.

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

6. **Get Your Server URL**
   - The CLI will output your deployment URL
   - Your endpoint: `https://your-project.vercel.app/api/kb/search`

## After Deployment

1. **Update your local `.env` file** with the deployed URL:
   ```
   KB_SERVER_URL=https://your-project.vercel.app/api/kb/search
   ```

2. **Test the endpoint**:
   ```bash
   curl -X POST https://your-project.vercel.app/api/kb/search \
     -H "Content-Type: application/json" \
     -d '{
       "message": {
         "type": "knowledge-base-request",
         "messages": [
           {
             "role": "user",
             "content": "What houses are available?"
           }
         ]
       }
     }'
   ```

3. **Create and attach knowledge base**:
   ```bash
   npm run create-kb YOUR_ASSISTANT_ID
   ```

## Troubleshooting

### Function Timeout
If you get timeout errors, Vercel's free tier has a 10-second timeout. Consider:
- Upgrading to Pro plan (60-second timeout)
- Optimizing your Pinecone queries
- Using caching

### Environment Variables Not Working
- Make sure you've added them in Vercel dashboard
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)

### CORS Issues
Vercel handles CORS automatically, but if you encounter issues, you can add headers in `vercel.json`.

## Production Considerations

- **Custom Domain**: Add a custom domain in Vercel settings for a professional URL
- **Monitoring**: Use Vercel Analytics to monitor function performance
- **Logs**: Check Vercel dashboard → Functions → Logs for debugging

