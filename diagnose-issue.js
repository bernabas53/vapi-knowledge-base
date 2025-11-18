/**
 * Comprehensive diagnostic script to identify the knowledge base issue
 */

require('dotenv').config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const KB_SERVER_URL = process.env.KB_SERVER_URL;

async function diagnose() {
  console.log('🔍 Comprehensive Knowledge Base Diagnostic\n');
  console.log('='.repeat(60) + '\n');
  
  // 1. Check Knowledge Base
  console.log('1️⃣  Checking Knowledge Base Configuration...\n');
  try {
    const kbResponse = await fetch('https://api.vapi.ai/knowledge-base/b8acfe96-28ed-4da2-8bd2-2bf2b32ab994', {
      headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
    });
    const kb = await kbResponse.json();
    console.log('✅ Knowledge Base Found:');
    console.log(`   ID: ${kb.id}`);
    console.log(`   Provider: ${kb.provider}`);
    console.log(`   Server URL: ${kb.server?.url}`);
    console.log(`   Secret configured: ${!!kb.server?.secret}\n`);
    
    // Test if endpoint is accessible
    console.log('2️⃣  Testing Endpoint Accessibility...\n');
    try {
      const testResponse = await fetch(kb.server.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            type: 'knowledge-base-request',
            messages: [{ role: 'user', content: 'test' }]
          }
        })
      });
      
      const testText = await testResponse.text();
      console.log(`   Status: ${testResponse.status}`);
      console.log(`   Response: ${testText.substring(0, 100)}...\n`);
      
      if (testResponse.status === 401 && testText.includes('Invalid signature')) {
        console.log('⚠️  ISSUE FOUND: Endpoint still returning signature error');
        console.log('   This means Vercel is serving cached code.\n');
        console.log('   SOLUTION: Go to Vercel dashboard and manually redeploy\n');
      } else if (testResponse.ok) {
        console.log('✅ Endpoint is accessible!\n');
      }
    } catch (e) {
      console.log(`   ❌ Error testing endpoint: ${e.message}\n`);
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}\n`);
  }
  
  // 2. Check Assistant
  console.log('3️⃣  Checking Assistant Configuration...\n');
  try {
    const assistantResponse = await fetch('https://api.vapi.ai/assistant/6dbc107c-d846-4d66-81c6-75a129de20a8', {
      headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
    });
    const assistant = await assistantResponse.json();
    
    console.log('✅ Assistant Configuration:');
    console.log(`   Knowledge Base ID: ${assistant.model?.knowledgeBaseId || 'NOT SET'}`);
    console.log(`   Model: ${assistant.model?.model}`);
    console.log(`   Provider: ${assistant.model?.provider}`);
    console.log(`   Tools: ${assistant.model?.toolIds?.length || 0} tool(s)\n`);
    
    if (!assistant.model?.knowledgeBaseId) {
      console.log('❌ ISSUE: Knowledge base not attached to assistant!\n');
    } else {
      console.log('✅ Knowledge base is attached\n');
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}\n`);
  }
  
  // 3. Recommendations
  console.log('4️⃣  Recommendations:\n');
  console.log('   Based on the error "Your server rejected tool-calls webhook":');
  console.log('   - Vapi is trying to use tools, but knowledge base should work automatically');
  console.log('   - The endpoint might not be accessible due to signature verification');
  console.log('   - Vercel might be serving cached code\n');
  console.log('   ACTION ITEMS:');
  console.log('   1. Go to Vercel dashboard and manually trigger a redeploy');
  console.log('   2. Check Vercel function logs to see if Vapi is calling the endpoint');
  console.log('   3. Verify the endpoint works by testing it directly');
  console.log('   4. Make sure deployment protection is disabled\n');
}

diagnose();

