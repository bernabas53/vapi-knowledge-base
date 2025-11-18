/**
 * Test Vapi assistant by creating a call and checking logs
 */

require('dotenv').config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = '6dbc107c-d846-4d66-81c6-75a129de20a8';

async function testCall() {
  console.log('🧪 Testing Vapi Assistant via Call\n');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Get assistant details
    console.log('1️⃣  Getting assistant details...\n');
    const assistantResponse = await fetch(`https://api.vapi.ai/assistant/${ASSISTANT_ID}`, {
      headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
    });
    
    const assistant = await assistantResponse.json();
    console.log('✅ Assistant found:');
    console.log(`   Name: ${assistant.name}`);
    console.log(`   Type: ${assistant.type || 'voice'}`);
    console.log(`   Knowledge Base ID: ${assistant.model?.knowledgeBaseId || 'NOT SET'}\n`);
    
    // Check recent calls
    console.log('2️⃣  Checking recent calls...\n');
    const callsResponse = await fetch('https://api.vapi.ai/call', {
      headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
    });
    
    if (callsResponse.ok) {
      const calls = await callsResponse.json();
      console.log(`Found ${calls.length} recent calls\n`);
      
      // Get the most recent call
      if (calls.length > 0) {
        const recentCall = calls[0];
        console.log('📞 Most recent call:');
        console.log(`   ID: ${recentCall.id}`);
        console.log(`   Status: ${recentCall.status}`);
        console.log(`   Created: ${recentCall.createdAt}\n`);
        
        // Get logs for this call
        console.log('3️⃣  Fetching call logs...\n');
        const logsResponse = await fetch(`https://api.vapi.ai/call/${recentCall.id}/logs`, {
          headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
        });
        
        if (logsResponse.ok) {
          const logs = await logsResponse.json();
          console.log(`Found ${logs.length} log entries\n`);
          
          // Filter knowledge base related logs
          const kbLogs = logs.filter(log => {
            const body = log.body || '';
            const attrs = log.attributes || {};
            return body.includes('knowledge') || 
                   body.includes('kb/search') ||
                   body.includes('Invalid signature') ||
                   body.includes('error') ||
                   attrs.url?.includes('kb/search') ||
                   attrs.messageType === 'knowledge-base-request';
          });
          
          if (kbLogs.length > 0) {
            console.log('📋 Knowledge Base Related Logs:\n');
            kbLogs.forEach((log, i) => {
              console.log(`\n--- Log ${i + 1} ---`);
              console.log(`Time: ${new Date(log.time).toISOString()}`);
              console.log(`Level: ${log.severityText}`);
              console.log(`Body: ${log.body}`);
              if (log.attributes) {
                if (log.attributes.errorMessage) {
                  console.log(`Error: ${log.attributes.errorMessage}`);
                }
                if (log.attributes.url) {
                  console.log(`URL: ${log.attributes.url}`);
                }
                if (log.attributes.statusCode) {
                  console.log(`Status: ${log.attributes.statusCode}`);
                }
                if (log.attributes.success !== undefined) {
                  console.log(`Success: ${log.attributes.success}`);
                }
              }
            });
          } else {
            console.log('⚠️  No knowledge base logs found in recent call\n');
            console.log('Showing last 10 logs instead:\n');
            logs.slice(-10).forEach((log, i) => {
              console.log(`${i + 1}. [${log.severityText}] ${log.body}`);
            });
          }
        }
      }
    }
    
    // Check Vercel endpoint directly
    console.log('\n4️⃣  Testing Vercel endpoint directly...\n');
    const kbUrl = 'https://vapi-knowledge-base-d7kgkbcsh.vercel.app/api/kb/search';
    const testPayload = {
      message: {
        type: 'knowledge-base-request',
        messages: [
          { role: 'user', content: 'What houses are available in Salt Lake City?' }
        ]
      }
    };
    
    const endpointResponse = await fetch(kbUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });
    
    console.log(`Status: ${endpointResponse.status}`);
    const endpointText = await endpointResponse.text();
    console.log(`Response: ${endpointText.substring(0, 200)}...\n`);
    
    if (endpointResponse.ok) {
      try {
        const endpointJson = JSON.parse(endpointText);
        if (endpointJson.documents) {
          console.log(`✅ Endpoint working! Found ${endpointJson.documents.length} documents`);
        }
      } catch (e) {
        console.log('Response is not JSON');
      }
    } else {
      console.log('❌ Endpoint still returning error');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testCall();

