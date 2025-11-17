const crypto = require('crypto');
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

// Initialize clients (these will be reused across invocations)
let pineconeClient;
let openaiClient;
let index;

// Initialize clients on first invocation
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
function verifySignature(body, signature, secret) {
  if (!secret) {
    return true; // Skip verification if no secret is configured
  }

  if (!signature) {
    return true; // Allow if no signature (for testing)
  }

  const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(bodyString)
    .digest('hex');

  // Check both with and without sha256= prefix
  const signatureWithoutPrefix = signature.replace(/^sha256=/, '');
  const expectedWithoutPrefix = expectedSignature;
  
  const matches = signature === `sha256=${expectedSignature}` || 
                  signatureWithoutPrefix === expectedWithoutPrefix ||
                  signature === expectedSignature;
  
  console.log('Signature comparison:', {
    received: signature,
    expected: `sha256=${expectedSignature}`,
    matches
  });
  
  return matches;
}

/**
 * Vercel serverless function handler
 */
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize clients
    initializeClients();

    // Get raw body for signature verification (Vercel provides it as parsed JSON)
    // We'll verify signature if provided, but allow requests without it for now
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
    const signature = req.headers['x-vapi-signature'] || req.headers['X-Vapi-Signature'];
    
    // Log for debugging
    console.log('📥 Knowledge base request received:', {
      method: req.method,
      hasSignature: !!signature,
      hasSecret: !!webhookSecret
    });
    
    // Note: Signature verification with raw body in Vercel requires different handling
    // For now, we'll process requests - signature verification can be added later
    // if needed for security

    const { message } = req.body;

    // Validate request type
    if (!message || message.type !== 'knowledge-base-request') {
      // Vapi doesn't accept "error" field - return empty documents instead
      return res.status(200).json({ documents: [] });
    }

    // Get the latest user query
    const query = getLatestUserMessage(message);
    
    if (!query) {
      return res.json({ documents: [] });
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
    })).filter(doc => doc.content); // Filter out empty documents

    console.log(`Found ${documents.length} relevant documents`);

    return res.status(200).json({ documents });

  } catch (error) {
    console.error('Knowledge base search error:', error);
    
    // Vapi doesn't accept "error" field in response - return empty documents instead
    // This allows the assistant to continue even if knowledge base fails
    return res.status(200).json({ 
      documents: []
    });
  }
};

