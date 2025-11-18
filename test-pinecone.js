/**
 * Test script to verify Pinecone has data and test the knowledge base endpoint
 */

const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'vapi-knowledge-base';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-ada-002';
const KB_SERVER_URL = process.env.KB_SERVER_URL;

async function checkPineconeData() {
  console.log('🔍 Checking Pinecone data...\n');
  
  try {
    // Initialize Pinecone
    const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
    const index = pinecone.index(PINECONE_INDEX_NAME);
    
    console.log(`✓ Connected to Pinecone index: ${PINECONE_INDEX_NAME}\n`);
    
    // Get index stats
    const stats = await index.describeIndexStats();
    console.log('📊 Index Statistics:');
    console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
    console.log(`   Dimension: ${stats.dimension || 'N/A'}`);
    console.log(`   Index fullness: ${stats.indexFullness || 'N/A'}\n`);
    
    if (stats.totalRecordCount === 0) {
      console.log('⚠️  WARNING: No vectors found in Pinecone index!');
      console.log('   Run: npm run populate\n');
      return false;
    }
    
    // Test query with a sample search
    console.log('🔎 Testing search query...\n');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    
    const testQuery = "What houses are available in Salt Lake City?";
    console.log(`Query: "${testQuery}"\n`);
    
    // Generate embedding
    console.log(`Using embedding model: ${EMBEDDING_MODEL}\n`);
    const embeddingResponse = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: testQuery,
    });
    
    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log(`✓ Generated embedding (dimension: ${queryEmbedding.length})\n`);
    
    if (queryEmbedding.length !== stats.dimension) {
      console.log(`⚠️  WARNING: Embedding dimension (${queryEmbedding.length}) doesn't match index dimension (${stats.dimension})!`);
      console.log(`   This will cause search to fail. Check your EMBEDDING_MODEL setting.\n`);
      return false;
    }
    
    // Search Pinecone
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });
    
    console.log(`✓ Found ${searchResults.matches.length} results:\n`);
    
    searchResults.matches.forEach((match, i) => {
      console.log(`Result ${i + 1}:`);
      console.log(`   Score: ${match.score?.toFixed(4)}`);
      console.log(`   ID: ${match.id}`);
      if (match.metadata?.address) {
        console.log(`   Address: ${match.metadata.address}`);
      }
      if (match.metadata?.price) {
        console.log(`   Price: ${match.metadata.price}`);
      }
      const contentPreview = (match.metadata?.content || '').substring(0, 100);
      console.log(`   Content: ${contentPreview}...\n`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error checking Pinecone:', error.message);
    if (error.message.includes('index not found')) {
      console.log('\n💡 Make sure your Pinecone index name matches:');
      console.log(`   Expected: ${PINECONE_INDEX_NAME}`);
      console.log('   Check your .env file for PINECONE_INDEX_NAME\n');
    }
    return false;
  }
}

async function testKnowledgeBaseEndpoint() {
  if (!KB_SERVER_URL) {
    console.log('⚠️  KB_SERVER_URL not set in .env, skipping endpoint test\n');
    return;
  }
  
  console.log('🌐 Testing Knowledge Base Endpoint...\n');
  console.log(`URL: ${KB_SERVER_URL}\n`);
  
  try {
    const testPayload = {
      message: {
        type: 'knowledge-base-request',
        messages: [
          {
            role: 'user',
            content: 'What houses are available in Salt Lake City?'
          }
        ]
      }
    };
    
    console.log('Sending test request...\n');
    
    const response = await fetch(KB_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    console.log(`Response Status: ${response.status} ${response.statusText}\n`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error Response:');
      console.log(errorText);
      return false;
    }
    
    const data = await response.json();
    
    console.log('✅ Success! Response:\n');
    console.log(`Found ${data.documents?.length || 0} documents:\n`);
    
    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((doc, i) => {
        console.log(`Document ${i + 1}:`);
        console.log(`   Similarity: ${doc.similarity?.toFixed(4)}`);
        console.log(`   UUID: ${doc.uuid || 'N/A'}`);
        const contentPreview = (doc.content || '').substring(0, 150);
        console.log(`   Content: ${contentPreview}...\n`);
      });
    } else {
      console.log('⚠️  No documents returned. This might indicate:');
      console.log('   - Pinecone index is empty');
      console.log('   - Query didn\'t match any documents');
      console.log('   - Server configuration issue\n');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure your Vercel deployment is live and accessible\n');
    }
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Knowledge Base Setup\n');
  console.log('=' .repeat(50) + '\n');
  
  // Check Pinecone
  const pineconeOk = await checkPineconeData();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test endpoint
  const endpointOk = await testKnowledgeBaseEndpoint();
  
  console.log('\n' + '='.repeat(50) + '\n');
  console.log('📋 Test Summary:\n');
  console.log(`   Pinecone Data: ${pineconeOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`   Endpoint Test: ${endpointOk ? '✅ OK' : '❌ FAILED'}`);
  
  if (pineconeOk && endpointOk) {
    console.log('\n🎉 Everything looks good! Your knowledge base is ready to use.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.\n');
  }
}

main().catch(console.error);

