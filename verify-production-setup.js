/**
 * Comprehensive verification script for production setup
 */

require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const crypto = require('crypto');

const ASSISTANT_ID = '22ac0009-6ebb-411e-90e1-ce5bab7e64fc';
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const KB_URL = process.env.KB_SERVER_URL || 'https://vapi-knowledge-base.vercel.app/api/kb/search';

async function checkAssistant() {
  console.log('1️⃣ Checking Assistant Configuration...\n');
  
  try {
    const response = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
      headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
    });
    
    if (!response.ok) {
      console.log('❌ Assistant not found:', response.status);
      return false;
    }
    
    const assistant = await response.json();
    console.log('✅ Assistant Found:');
    console.log(`   Name: ${assistant.name || 'N/A'}`);
    console.log(`   Model: ${assistant.model?.model || 'N/A'}`);
    console.log(`   Knowledge Base ID: ${assistant.model?.knowledgeBaseId || '❌ NOT ATTACHED'}`);
    
    if (assistant.model?.knowledgeBaseId) {
      const kbResponse = await fetch(`https://api.vapi.ai/knowledge-base/${assistant.model.knowledgeBaseId}`, {
        headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
      });
      
      if (kbResponse.ok) {
        const kb = await kbResponse.json();
        console.log(`   KB Server URL: ${kb.server?.url || 'N/A'}`);
      }
    }
    
    return !!assistant.model?.knowledgeBaseId;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function checkLocalPinecone() {
  console.log('\n2️⃣ Checking Local Pinecone Configuration...\n');
  
  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX_NAME;
    const index = pinecone.index(indexName);
    
    console.log(`Index Name: ${indexName}`);
    console.log(`API Key: ${process.env.PINECONE_API_KEY ? process.env.PINECONE_API_KEY.substring(0, 15) + '...' : 'NOT SET'}\n`);
    
    const stats = await index.describeIndexStats();
    console.log('✅ Local Pinecone Stats:');
    console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
    console.log(`   Dimension: ${stats.dimension || 'N/A'}`);
    
    if (stats.totalRecordCount === 0) {
      console.log('\n⚠️  WARNING: Local Pinecone index is EMPTY!');
      return false;
    }
    
    // Test a query
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const embedding = await openai.embeddings.create({
      model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
      input: 'test query'
    });
    
    const results = await index.query({
      vector: embedding.data[0].embedding,
      topK: 1,
      includeMetadata: true
    });
    
    console.log(`   Test query returned: ${results.matches.length} result(s)`);
    
    return true;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testEndpoint() {
  console.log('\n3️⃣ Testing Production Endpoint...\n');
  console.log(`URL: ${KB_URL}\n`);
  
  const testQuery = 'What houses are available in Salt Lake City?';
  const requestBody = {
    message: {
      type: 'knowledge-base-request',
      messages: [{ role: 'user', content: testQuery }]
    }
  };
  
  const bodyString = JSON.stringify(requestBody);
  const webhookSecret = process.env.VAPI_WEBHOOK_SECRET || '';
  const signature = crypto.createHmac('sha256', webhookSecret).update(bodyString).digest('hex');
  
  try {
    const response = await fetch(KB_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vapi-signature': `sha256=${signature}`
      },
      body: bodyString
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (data.error) {
      console.log(`❌ Error: ${data.error}`);
      return false;
    }
    
    if (data.documents && data.documents.length > 0) {
      console.log(`✅ SUCCESS! Endpoint returned ${data.documents.length} document(s)`);
      console.log(`\nFirst document:`);
      console.log(`   Similarity: ${data.documents[0].similarity}`);
      console.log(`   Content preview: ${data.documents[0].content.substring(0, 150)}...`);
      return true;
    } else {
      console.log(`⚠️  Endpoint returned empty documents array`);
      console.log(`\nThis could mean:`);
      console.log(`   - Vercel is using different Pinecone credentials (old ones)`);
      console.log(`   - Production Pinecone index is empty`);
      console.log(`   - Vercel env vars haven't been updated yet`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Production Setup Verification\n');
  console.log('='.repeat(60) + '\n');
  
  const results = {
    assistant: await checkAssistant(),
    localPinecone: await checkLocalPinecone(),
    endpoint: await testEndpoint()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Verification Summary:\n');
  console.log(`   Assistant Config: ${results.assistant ? '✅ OK' : '❌ FAILED'}`);
  console.log(`   Local Pinecone: ${results.localPinecone ? '✅ OK' : '❌ FAILED'}`);
  console.log(`   Endpoint Test: ${results.endpoint ? '✅ OK' : '❌ FAILED'}`);
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  if (results.assistant && results.localPinecone && results.endpoint) {
    console.log('🎉 Everything is working perfectly!');
    console.log('   Your production knowledge base is ready to use.\n');
  } else {
    console.log('⚠️  Some checks failed. Issues to address:\n');
    
    if (!results.assistant) {
      console.log('   ❌ Assistant: Knowledge base not attached');
    }
    
    if (!results.localPinecone) {
      console.log('   ❌ Local Pinecone: Index is empty or misconfigured');
      console.log('      Run: npm run populate');
    }
    
    if (!results.endpoint) {
      console.log('   ❌ Endpoint: Not returning documents');
      console.log('      Check Vercel environment variables:');
      console.log('      - PINECONE_API_KEY');
      console.log('      - PINECONE_INDEX_NAME');
      console.log('      Make sure they match your production Pinecone account');
      console.log('      URL: https://vercel.com/bernabastewodros-gmailcoms-projects/vapi-knowledge-base/settings/environment-variables');
    }
  }
}

main().catch(console.error);

