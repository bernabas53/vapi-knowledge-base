const express = require('express');
const crypto = require('crypto');
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Initialize OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get Pinecone index
let index;
(async () => {
  try {
    const indexName = process.env.PINECONE_INDEX_NAME || 'vapi-knowledge-base';
    index = pinecone.index(indexName);
    console.log(`Connected to Pinecone index: ${indexName}`);
  } catch (error) {
    console.error('Error connecting to Pinecone:', error);
  }
})();

/**
 * Extract the latest user message from the conversation
 */
function getLatestUserMessage(message) {
  if (!message || !message.messages) {
    return '';
  }
  
  const userMessages = message.messages.filter(msg => msg.role === 'user');
  return userMessages[userMessages.length - 1]?.content || '';
}

/**
 * Verify webhook signature for security
 */
function verifySignature(req, secret) {
  if (!secret) {
    return true; // Skip verification if no secret is configured
  }

  const signature = req.headers['x-vapi-signature'];
  if (!signature) {
    return false;
  }

  const bodyString = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(bodyString)
    .digest('hex');

  return signature === `sha256=${expectedSignature}`;
}

/**
 * Main knowledge base search endpoint
 */
app.post('/kb/search', async (req, res) => {
  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
    if (webhookSecret && !verifySignature(req, webhookSecret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { message } = req.body;

    // Validate request type
    if (!message || message.type !== 'knowledge-base-request') {
      return res.status(400).json({ error: 'Invalid request type' });
    }

    // Get the latest user query
    const query = getLatestUserMessage(message);
    
    if (!query) {
      return res.json({ documents: [] });
    }

    console.log(`Searching for: "${query}"`);

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search Pinecone
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: parseInt(process.env.TOP_K_RESULTS || '5'),
      includeMetadata: true,
    });

    // Format response for Vapi
    const documents = searchResults.matches.map(match => ({
      content: match.metadata?.content || match.metadata?.text || '',
      similarity: match.score || 0,
      uuid: match.id || undefined,
    })).filter(doc => doc.content); // Filter out empty documents

    console.log(`Found ${documents.length} relevant documents`);

    res.json({ documents });

  } catch (error) {
    console.error('Knowledge base search error:', error);
    
    // Return empty documents rather than failing completely
    res.status(500).json({ 
      documents: [],
      error: 'Search temporarily unavailable'
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Custom Knowledge Base server running on port ${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/kb/search`);
});

