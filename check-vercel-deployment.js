/**
 * Check what's actually deployed on Vercel
 */

require('dotenv').config();

async function checkDeployment() {
  console.log('🔍 Checking Vercel Deployment Status\n');
  
  const url = 'https://vapi-knowledge-base-d7kgkbcsh.vercel.app/api/kb/search';
  
  // Test 1: Check if endpoint responds
  console.log('1️⃣  Testing endpoint...\n');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          type: 'knowledge-base-request',
          messages: [{ role: 'user', content: 'test' }]
        }
      }),
    });
    
    const text = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${text}\n`);
    
    if (response.status === 401 && text.includes('Invalid signature')) {
      console.log('❌ PROBLEM: Endpoint still returning signature error');
      console.log('   This means Vercel is serving OLD cached code\n');
      console.log('   SOLUTION:');
      console.log('   1. Go to Vercel dashboard');
      console.log('   2. Settings → Functions');
      console.log('   3. Clear function cache');
      console.log('   4. OR delete and recreate the deployment');
      console.log('   5. OR wait 10-15 minutes for cache to expire\n');
    } else if (response.ok) {
      console.log('✅ Endpoint is working!\n');
      try {
        const json = JSON.parse(text);
        if (json.documents) {
          console.log(`Found ${json.documents.length} documents`);
        }
      } catch (e) {
        // Not JSON
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  // Test 2: Check local code
  console.log('2️⃣  Checking local code...\n');
  const fs = require('fs');
  const code = fs.readFileSync('api/kb/search.js', 'utf-8');
  
  if (code.includes('Invalid signature')) {
    console.log('❌ Local code still has signature verification!');
  } else if (code.includes('verifySignature')) {
    console.log('⚠️  Local code has verifySignature function but not using it');
  } else {
    console.log('✅ Local code is clean - no signature verification');
  }
  
  if (code.includes('error:') || code.includes('"error"')) {
    console.log('⚠️  Local code still has error fields');
  } else {
    console.log('✅ Local code has no error fields');
  }
  
  console.log(`\nFile size: ${code.length} characters`);
  console.log(`Line count: ${code.split('\\n').length} lines\n`);
}

checkDeployment();

