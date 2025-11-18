/**
 * Test endpoint with exact format Vapi would send
 */

require('dotenv').config();

const KB_SERVER_URL = process.env.KB_SERVER_URL;

async function test() {
  console.log('🧪 Testing with Vapi-like request format\n');
  
  // This is the format Vapi sends according to documentation
  const vapiRequest = {
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
  
  console.log('Request:', JSON.stringify(vapiRequest, null, 2));
  console.log('\nSending to:', KB_SERVER_URL);
  console.log('\n' + '='.repeat(50) + '\n');
  
  try {
    const response = await fetch(KB_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Vapi might send signature, but we've disabled verification
      },
      body: JSON.stringify(vapiRequest),
    });
    
    console.log(`Status: ${response.status} ${response.statusText}\n`);
    
    const text = await response.text();
    console.log('Response:', text);
    
    try {
      const json = JSON.parse(text);
      if (json.documents) {
        console.log(`\n✅ SUCCESS! Found ${json.documents.length} documents`);
        json.documents.forEach((doc, i) => {
          console.log(`\nDocument ${i + 1}:`);
          console.log(`  Similarity: ${doc.similarity}`);
          console.log(`  Content preview: ${doc.content.substring(0, 150)}...`);
        });
      } else if (json.error) {
        console.log(`\n❌ Error: ${json.error}`);
      }
    } catch (e) {
      console.log('\n⚠️  Response is not JSON');
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

test();

