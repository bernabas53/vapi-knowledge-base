/**
 * Test Vapi assistant directly via API to diagnose knowledge base issues
 */

require('dotenv').config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = '6dbc107c-d846-4d66-81c6-75a129de20a8';

if (!VAPI_API_KEY) {
  console.error('Error: VAPI_API_KEY not set in .env');
  process.exit(1);
}

async function testAssistant() {
  console.log('🧪 Testing Vapi Assistant with Knowledge Base\n');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Step 1: Create a conversation
    console.log('1️⃣  Creating conversation...\n');
    const conversationResponse = await fetch('https://api.vapi.ai/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify({
        assistantId: ASSISTANT_ID,
      }),
    });
    
    if (!conversationResponse.ok) {
      const errorText = await conversationResponse.text();
      throw new Error(`Failed to create conversation: ${conversationResponse.status} ${errorText}`);
    }
    
    const conversation = await conversationResponse.json();
    console.log('✅ Conversation created:');
    console.log(`   ID: ${conversation.id}\n`);
    
    // Step 2: Send a message
    console.log('2️⃣  Sending message: "What houses are available in Salt Lake City?"\n');
    const messageResponse = await fetch(`https://api.vapi.ai/conversation/${conversation.id}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify({
        role: 'user',
        content: 'What houses are available in Salt Lake City?',
      }),
    });
    
    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      throw new Error(`Failed to send message: ${messageResponse.status} ${errorText}`);
    }
    
    const messageResult = await messageResponse.json();
    console.log('✅ Message sent\n');
    
    // Step 3: Wait a bit for processing
    console.log('3️⃣  Waiting for assistant response...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 4: Get conversation messages
    console.log('4️⃣  Checking conversation messages...\n');
    const messagesResponse = await fetch(`https://api.vapi.ai/conversation/${conversation.id}/message`, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });
    
    if (messagesResponse.ok) {
      const messages = await messagesResponse.json();
      console.log(`Found ${messages.length} messages:\n`);
      messages.forEach((msg, i) => {
        console.log(`Message ${i + 1}:`);
        console.log(`  Role: ${msg.role}`);
        console.log(`  Content: ${(msg.content || '').substring(0, 200)}...\n`);
      });
    }
    
    // Step 5: Get call logs if this was a call
    console.log('5️⃣  Checking for call logs...\n');
    if (conversation.callId) {
      const logsResponse = await fetch(`https://api.vapi.ai/call/${conversation.callId}/logs`, {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
        },
      });
      
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        console.log(`Found ${logs.length} log entries\n`);
        
        // Look for knowledge base related logs
        const kbLogs = logs.filter(log => 
          log.body?.includes('knowledge') || 
          log.attributes?.url?.includes('kb/search') ||
          log.body?.includes('Invalid signature') ||
          log.body?.includes('error')
        );
        
        if (kbLogs.length > 0) {
          console.log('📋 Knowledge Base Related Logs:\n');
          kbLogs.forEach((log, i) => {
            console.log(`Log ${i + 1}:`);
            console.log(`  Level: ${log.severityText}`);
            console.log(`  Body: ${log.body}`);
            if (log.attributes?.errorMessage) {
              console.log(`  Error: ${log.attributes.errorMessage}`);
            }
            if (log.attributes?.url) {
              console.log(`  URL: ${log.attributes.url}`);
            }
            console.log('');
          });
        } else {
          console.log('⚠️  No knowledge base logs found\n');
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Test completed!');
    console.log(`\nConversation ID: ${conversation.id}`);
    if (conversation.callId) {
      console.log(`Call ID: ${conversation.callId}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  }
}

testAssistant();

