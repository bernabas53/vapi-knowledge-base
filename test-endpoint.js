/**
 * Test script to simulate Vapi's request to the knowledge base endpoint
 */

require('dotenv').config();
const crypto = require('crypto');

const KB_SERVER_URL = process.env.KB_SERVER_URL;
const WEBHOOK_SECRET = process.env.VAPI_WEBHOOK_SECRET;

if (!KB_SERVER_URL) {
  console.error('Error: KB_SERVER_URL not set in .env');
  process.exit(1);
}

async function testEndpoint() {
  console.log('🧪 Testing Knowledge Base Endpoint\n');
  console.log(`URL: ${KB_SERVER_URL}\n`);
  
  // Simulate Vapi's request format
  const requestBody = {
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
  
  // Create signature if secret is configured
  let headers = {
    'Content-Type': 'application/json',
  };
  
  if (WEBHOOK_SECRET) {
    const bodyString = JSON.stringify(requestBody);
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(bodyString)
      .digest('hex');
    
    headers['x-vapi-signature'] = `sha256=${signature}`;
    console.log('✓ Generated webhook signature\n');
  } else {
    console.log('⚠️  No webhook secret configured, sending without signature\n');
  }
  
  console.log('Sending request...\n');
  console.log('Request body:', JSON.stringify(requestBody, null, 2));
  console.log('\nHeaders:', JSON.stringify(headers, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');
  
  try {
    const response = await fetch(KB_SERVER_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });
    
    console.log(`Response Status: ${response.status} ${response.statusText}\n`);
    
    const responseText = await response.text();
    console.log('Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log('\nResponse Body:');
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log(JSON.stringify(responseJson, null, 2));
      
      if (responseJson.documents) {
        console.log(`\n✅ Success! Found ${responseJson.documents.length} documents:\n`);
        responseJson.documents.forEach((doc, i) => {
          console.log(`Document ${i + 1}:`);
          console.log(`  Similarity: ${doc.similarity?.toFixed(4)}`);
          console.log(`  UUID: ${doc.uuid || 'N/A'}`);
          const preview = (doc.content || '').substring(0, 200);
          console.log(`  Content: ${preview}...\n`);
        });
      } else if (responseJson.error) {
        console.log(`\n❌ Error: ${responseJson.error}`);
      }
    } catch (e) {
      console.log(responseText);
      if (responseText.includes('Authentication Required')) {
        console.log('\n⚠️  Vercel deployment protection is blocking the request.');
        console.log('   This is normal - Vapi will be able to call it via server-to-server.');
        console.log('   Check Vercel logs to see if Vapi is successfully calling it.');
      }
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure your Vercel deployment is live and accessible');
    }
  }
}

testEndpoint();

