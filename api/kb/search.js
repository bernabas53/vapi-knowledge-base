const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

// Initialize clients (reused across invocations)
let pineconeClient;
let openaiClient;
let index;

function initializeClients() {
  try {
    if (!pineconeClient) {
      const pineconeApiKey = process.env.PINECONE_API_KEY?.trim();
      if (!pineconeApiKey) {
        throw new Error('PINECONE_API_KEY is not set in environment variables');
      }
      pineconeClient = new Pinecone({
        apiKey: pineconeApiKey,
      });
    }
    
    if (!openaiClient) {
      const apiKey = process.env.OPENAI_API_KEY?.trim();
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set in environment variables');
      }
      openaiClient = new OpenAI({
        apiKey: apiKey,
      });
    }
    
    if (!index) {
      const indexName = process.env.PINECONE_INDEX_NAME || 'vapi-knowledge-base';
      if (!indexName) {
        throw new Error('PINECONE_INDEX_NAME is not set');
      }
      index = pineconeClient.index(indexName);
    }
  } catch (error) {
    console.error('Error initializing clients:', error.message);
    throw error;
  }
}

function getLatestUserMessage(message) {
  if (!message) {
    return '';
  }
  
  // Handle different message formats
  let messages = message.messages;
  
  // If messages is not an array, try to find it elsewhere
  if (!Array.isArray(messages)) {
    // Maybe messages are nested differently
    if (message.conversation && Array.isArray(message.conversation)) {
      messages = message.conversation;
    } else if (message.history && Array.isArray(message.history)) {
      messages = message.history;
    } else {
      return '';
    }
  }
  
  // Filter for user messages
  const userMessages = messages.filter(msg => 
    msg && (msg.role === 'user' || msg.type === 'user')
  );
  
  // Get the latest user message content
  const latestMessage = userMessages[userMessages.length - 1];
  
  if (!latestMessage) {
    return '';
  }
  
  // Try different content field names
  return latestMessage.content || latestMessage.text || latestMessage.message || '';
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(200).json({ documents: [] });
  }

  try {
    // Check environment variables first
    const envCheck = {
      PINECONE_API_KEY: !!process.env.PINECONE_API_KEY,
      PINECONE_INDEX_NAME: !!process.env.PINECONE_INDEX_NAME,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'text-embedding-3-large',
    };
    
    console.log('Environment variables check:', JSON.stringify(envCheck, null, 2));
    
    if (!envCheck.PINECONE_API_KEY) {
      console.error('❌ PINECONE_API_KEY is missing!');
      return res.status(200).json({ documents: [] });
    }
    
    if (!envCheck.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is missing!');
      return res.status(200).json({ documents: [] });
    }
    
    // Initialize clients
    initializeClients();

    // Log incoming request
    console.log('📥 Knowledge base request received - Latest version');
    console.log(`Using Pinecone index: ${process.env.PINECONE_INDEX_NAME || 'default'}`);
    console.log(`OpenAI API key set: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
    console.log(`Embedding model: ${process.env.EMBEDDING_MODEL || 'text-embedding-3-large'}`);

    // Log full request body for debugging
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { message } = req.body;

    // Validate request type
    if (!message || message.type !== 'knowledge-base-request') {
      console.log('Invalid request type, returning empty documents');
      console.log('Message object:', JSON.stringify(message, null, 2));
      return res.status(200).json({ documents: [] });
    }

    // Log message structure
    console.log('Message type:', message.type);
    console.log('Messages array:', JSON.stringify(message.messages, null, 2));
    console.log('Messages count:', message.messages?.length || 0);

    // Get the latest user query
    const query = getLatestUserMessage(message);
    
    console.log('Extracted query:', query || '(empty)');
    
    if (!query) {
      console.log('No query found, returning empty documents');
      console.log('Available message keys:', Object.keys(message || {}));
      return res.status(200).json({ documents: [] });
    }

    console.log(`Searching for: "${query}"`);

    // Generate embedding for the query
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return res.status(200).json({ documents: [] });
    }

    console.log('Calling OpenAI embeddings API...');
    // Trim model name to remove any whitespace/newlines
    const modelName = (process.env.EMBEDDING_MODEL || 'text-embedding-3-large').trim();
    console.log(`Using model: "${modelName}"`);
    const embeddingResponse = await openaiClient.embeddings.create({
      model: modelName,
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
