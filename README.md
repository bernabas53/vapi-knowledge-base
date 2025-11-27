# Vapi + Pinecone Knowledge Base Integration

A production-ready custom knowledge base server that connects your Vapi assistant with a Pinecone vector database. Perfect for creating intelligent assistants that can answer questions about your data using semantic search.

## Overview

The setup includes:
- **Custom Knowledge Base Server** (`server.js`) - Express server that handles Vapi requests and queries Pinecone
- **Pinecone Population Script** (`populate-pinecone.js`) - Script to upload your house listings to Pinecone
- **Knowledge Base Creation Script** (`create-knowledge-base.js`) - Script to create and attach the knowledge base to your Vapi assistant

## Prerequisites

- Node.js (v16 or higher)
- A Vapi account and API key
- A Pinecone account and API key
- An OpenAI API key (for creating embeddings)
- A publicly accessible server URL (for the webhook endpoint)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `env.example` to `.env` and fill in your credentials:

```bash
cp env.example .env
```

Edit `.env` with your actual values:
- `VAPI_API_KEY` - Your Vapi API key
- `PINECONE_API_KEY` - Your Pinecone API key
- `OPENAI_API_KEY` - Your OpenAI API key
- `KB_SERVER_URL` - Your publicly accessible server URL (e.g., `https://your-domain.com/kb/search`)
- `VAPI_WEBHOOK_SECRET` - A secret string for webhook verification
- `PINECONE_INDEX_NAME` - Your Pinecone index name (default: `vapi-knowledge-base`)

### 3. Create Pinecone Index

Before populating Pinecone, create an index:

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index with:
   - **Name**: `vapi-knowledge-base` (or your preferred name)
   - **Dimensions**: `1536` (for `text-embedding-ada-002`)
   - **Metric**: `cosine`

### 4. Populate Pinecone with House Listings

Run the population script to upload your house listings:

```bash
npm run populate
```

This will:
- Parse `House Listings.txt`
- Create embeddings using OpenAI
- Upload vectors to Pinecone

### 5. Deploy Your Server

#### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel login
   vercel link
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   Go to: Vercel Dashboard → Settings → Environment Variables
   
   Add these variables for **Production**:
   - `PINECONE_API_KEY` - Your Pinecone API key
   - `PINECONE_INDEX_NAME` - Your Pinecone index name
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `EMBEDDING_MODEL` - `text-embedding-3-large` (or your model)
   - `TOP_K_RESULTS` - `5` (optional)
   - `VAPI_WEBHOOK_SECRET` - Your webhook secret

4. **Redeploy** after adding environment variables (wait 1-2 minutes or manually redeploy)

5. **Get your deployment URL** (e.g., `https://your-project.vercel.app`)

#### Option B: Deploy to Other Platforms

- **Railway**: Connect your GitHub repo
- **Render**: Deploy from GitHub
- **Heroku**: `git push heroku main`
- **Your own server**: Use PM2 or similar

**Important**: 
- Make sure your server URL is accessible at the path `/api/kb/search` (for Vercel) or `/kb/search` (for Express)
- Update `KB_SERVER_URL` in your `.env` file with your deployed server URL

### 6. Create Knowledge Base and Attach to Assistant

Run the creation script:

```bash
# Create knowledge base only
npm run create-kb

# Create knowledge base and attach to assistant
npm run create-kb YOUR_ASSISTANT_ID
```

Replace `YOUR_ASSISTANT_ID` with your actual Vapi assistant ID.

## Testing

### Test the Server Locally

1. Start the server:
   ```bash
   npm start
   ```

2. Test the endpoint:
   ```bash
   curl -X POST http://localhost:3000/kb/search \
     -H "Content-Type: application/json" \
     -d '{
       "message": {
         "type": "knowledge-base-request",
         "messages": [
           {
             "role": "user",
             "content": "What houses are available in Salt Lake City?"
           }
         ]
       }
     }'
   ```

### Test with Vapi

Once deployed and attached to your assistant, test it by asking questions about house listings during a call or chat.

## Project Structure

```
.
├── server.js                 # Main Express server with Pinecone integration
├── populate-pinecone.js     # Script to upload listings to Pinecone
├── create-knowledge-base.js # Script to create/attach knowledge base
├── package.json             # Node.js dependencies
├── .env.example            # Environment variables template
├── House Listings.txt      # Your house listings data
└── README.md               # This file
```

## How It Works

1. **User Query**: User asks a question during a Vapi conversation
2. **Vapi Request**: Vapi sends a POST request to your `/kb/search` endpoint
3. **Embedding**: Server creates an embedding of the query using OpenAI
4. **Pinecone Search**: Server queries Pinecone for similar vectors
5. **Response**: Server returns relevant documents to Vapi
6. **AI Response**: Vapi's AI uses the documents to answer the user

## Customization

### Adjust Search Results

Edit `TOP_K_RESULTS` in `.env` to change how many results are returned (default: 5).

### Change Embedding Model

Update `EMBEDDING_MODEL` in `.env`. Make sure your Pinecone index dimensions match the model:
- `text-embedding-ada-002`: 1536 dimensions
- `text-embedding-3-small`: 1536 dimensions
- `text-embedding-3-large`: 3072 dimensions

### Modify Content Format

Edit `populate-pinecone.js` to change how listing content is formatted before creating embeddings.

## Troubleshooting

### Server Not Responding

- Check that your server is publicly accessible
- Verify the URL in `KB_SERVER_URL` is correct
- Check server logs for errors

### No Results from Pinecone

- Verify your Pinecone index has data (`npm run populate`)
- Check that the index name matches `PINECONE_INDEX_NAME`
- Ensure embeddings are created with the correct model

### Webhook Verification Fails

- Verify `VAPI_WEBHOOK_SECRET` matches in both `.env` and Vapi dashboard
- Check that signature verification is working correctly

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- Use HTTPS for your production server
- Implement rate limiting for production use
- Consider adding authentication beyond webhook signatures

## Support

For issues or questions:
- [Vapi Documentation](https://docs.vapi.ai/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)

