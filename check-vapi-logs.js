/**
 * Check if Vapi is calling the endpoint by examining what might be wrong
 */

require('dotenv').config();

async function checkKnowledgeBase() {
  const VAPI_API_KEY = process.env.VAPI_API_KEY;
  
  console.log('🔍 Checking Knowledge Base Configuration...\n');
  
  // Check knowledge base
  try {
    const kbResponse = await fetch('https://api.vapi.ai/knowledge-base/b8acfe96-28ed-4da2-8bd2-2bf2b32ab994', {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });
    
    if (kbResponse.ok) {
      const kb = await kbResponse.json();
      console.log('✅ Knowledge Base Found:');
      console.log(`   ID: ${kb.id}`);
      console.log(`   Provider: ${kb.provider}`);
      console.log(`   Server URL: ${kb.server?.url}`);
      console.log(`   Has Secret: ${!!kb.server?.secret}\n`);
    }
  } catch (e) {
    console.log('❌ Error checking knowledge base:', e.message);
  }
  
  // Check assistant
  try {
    const assistantResponse = await fetch('https://api.vapi.ai/assistant/6dbc107c-d846-4d66-81c6-75a129de20a8', {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });
    
    if (assistantResponse.ok) {
      const assistant = await assistantResponse.json();
      console.log('✅ Assistant Configuration:');
      console.log(`   Knowledge Base ID: ${assistant.model?.knowledgeBaseId || 'NOT SET'}`);
      console.log(`   Model: ${assistant.model?.model}`);
      console.log(`   Provider: ${assistant.model?.provider}\n`);
      
      if (!assistant.model?.knowledgeBaseId) {
        console.log('⚠️  WARNING: Knowledge base is not attached to assistant!\n');
      }
    }
  } catch (e) {
    console.log('❌ Error checking assistant:', e.message);
  }
  
  console.log('💡 Next Steps:');
  console.log('   1. Disable Vercel deployment protection (see disable-protection.md)');
  console.log('   2. Test your assistant again');
  console.log('   3. Check Vercel function logs for incoming requests');
}

checkKnowledgeBase();
