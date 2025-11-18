/**
 * Script to create a custom knowledge base in Vapi and attach it to an assistant
 * 
 * Usage:
 *   node create-knowledge-base.js [assistantId]
 * 
 * If assistantId is provided, the knowledge base will be attached to that assistant.
 * Otherwise, it will only create the knowledge base.
 */

require('dotenv').config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const KB_SERVER_URL = process.env.KB_SERVER_URL || 'https://your-domain.com/kb/search';
const WEBHOOK_SECRET = process.env.VAPI_WEBHOOK_SECRET || 'your-webhook-secret';

if (!VAPI_API_KEY) {
  console.error('Error: VAPI_API_KEY is required in .env file');
  process.exit(1);
}

async function createKnowledgeBase() {
  try {
    console.log('Creating custom knowledge base...');
    
    const response = await fetch('https://api.vapi.ai/knowledge-base', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify({
        provider: 'custom-knowledge-base',
        server: {
          url: KB_SERVER_URL,
          secret: WEBHOOK_SECRET,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create knowledge base: ${response.status} ${errorText}`);
    }

    const knowledgeBase = await response.json();
    console.log(`✅ Knowledge Base created successfully!`);
    console.log(`   ID: ${knowledgeBase.id}`);
    console.log(`   Provider: ${knowledgeBase.provider}`);
    console.log(`   Server URL: ${knowledgeBase.server?.url}`);
    
    return knowledgeBase;
  } catch (error) {
    console.error('Error creating knowledge base:', error.message);
    throw error;
  }
}

async function getAssistant(assistantId) {
  try {
    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get assistant: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting assistant:', error.message);
    throw error;
  }
}

async function attachToAssistant(assistantId, knowledgeBaseId) {
  try {
    console.log(`\nAttaching knowledge base to assistant ${assistantId}...`);
    
    // First, get the existing assistant to preserve configuration
    const existingAssistant = await getAssistant(assistantId);
    
    if (!existingAssistant.model) {
      throw new Error('Assistant does not have a model configuration');
    }

    // Update assistant with knowledge base
    const updatedModel = {
      ...existingAssistant.model,
      knowledgeBaseId: knowledgeBaseId,
    };

    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify({
        model: updatedModel,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update assistant: ${response.status} ${errorText}`);
    }

    const updatedAssistant = await response.json();
    console.log(`✅ Knowledge base attached to assistant successfully!`);
    console.log(`   Assistant ID: ${updatedAssistant.id}`);
    console.log(`   Knowledge Base ID: ${updatedAssistant.model?.knowledgeBaseId}`);
  } catch (error) {
    console.error('Error attaching knowledge base:', error.message);
    throw error;
  }
}

async function main() {
  const assistantId = process.argv[2];
  
  try {
    const knowledgeBase = await createKnowledgeBase();
    
    if (assistantId) {
      await attachToAssistant(assistantId, knowledgeBase.id);
    } else {
      console.log('\n⚠️  No assistant ID provided. Knowledge base created but not attached.');
      console.log(`   To attach it later, run:`);
      console.log(`   node create-knowledge-base.js ${knowledgeBase.id} <assistantId>`);
    }
    
    console.log('\n✨ Setup complete!');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();

