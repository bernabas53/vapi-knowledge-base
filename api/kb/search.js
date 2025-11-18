const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

// Initialize clients (reused across invocations)
let pineconeClient;
let openaiClient;
let index;

function initializeClients() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY?.trim(),
    });
  }
  
  if (!openaiClient) {
    // Trim API key to remove any newlines or whitespace that might cause HTTP header errors
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set or empty');
    }
    openaiClient = new OpenAI({
      apiKey: apiKey,
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
    console.log('📥 Knowledge base request received - Latest version');
    console.log(`Using Pinecone index: ${process.env.PINECONE_INDEX_NAME || 'default'}`);
    console.log(`OpenAI API key set: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
    console.log(`Embedding model: ${process.env.EMBEDDING_MODEL || 'text-embedding-ada-002'}`);

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
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return res.status(200).json({ documents: [] });
    }

    console.log('Calling OpenAI embeddings API...');
    const embeddingResponse = await openaiClient.embeddings.create({
      model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
      input: query,
    });
    console.log('OpenAI embeddings API call successful');

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
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    
    // Vapi doesn't accept "error" field - return empty documents instead
    return res.status(200).json({ 
      documents: []
    });
  }
};
