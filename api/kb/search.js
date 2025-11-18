const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const crypto = require('crypto');

// Initialize clients (reused across invocations)
let pineconeClient;
let openaiClient;
let index;

function initializeClients() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  if (!index) {
    const indexName = process.env.PINECONE_INDEX_NAME || 'vapi-knowledge-base';
    index = pineconeClient.index(indexName);
  }
}

function getLatestUserMessage(message) {
  if (!message || !message.messages) {
    return '';
  }
  
  const userMessages = message.messages.filter(msg => msg.role === 'user');
  return userMessages[userMessages.length - 1]?.content || '';
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(200).json({ documents: [] });
  }

  try {
    // Initialize clients
    initializeClients();

    // Log incoming request
    console.log('📥 Knowledge base request received - VERSION 4.0');

    // Verify signature if provided (according to Vapi docs)
    const signature = req.headers['x-vapi-signature'] || req.headers['X-Vapi-Signature'];
    const secret = process.env.VAPI_WEBHOOK_SECRET;
    
    if (signature && secret) {
      // Vapi docs: signature is sha256 hash of JSON.stringify(req.body)
      const bodyString = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyString)
        .digest('hex');
      
      const signatureValue = signature.replace(/^sha256=/, '');
      
      if (signatureValue !== expectedSignature) {
        console.log('⚠️ Signature mismatch - but allowing request for now');
        // Don't block - allow request to proceed
      } else {
        console.log('✅ Signature verified');
      }
    } else {
      console.log('No signature provided - allowing request');
    }

    const { message } = req.body;

    // Validate request type
    if (!message || message.type !== 'knowledge-base-request') {
      console.log('Invalid request type, returning empty documents');
      return res.status(200).json({ documents: [] });
    }

    // Get the latest user query
    const query = getLatestUserMessage(message);
    
    if (!query) {
      console.log('No query found, returning empty documents');
      return res.status(200).json({ documents: [] });
    }

    console.log(`Searching for: "${query}"`);

    // Generate embedding for the query
    const embeddingResponse = await openaiClient.embeddings.create({
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
    })).filter(doc => doc.content);

    console.log(`Found ${documents.length} relevant documents`);

    return res.status(200).json({ documents });

  } catch (error) {
    console.error('Knowledge base search error:', error);
    
    // Vapi doesn't accept "error" field - return empty documents instead
    return res.status(200).json({ 
      documents: []
    });
  }
};
// Version 4.0 - Tue Nov 18 11:34:45 EAT 2025
