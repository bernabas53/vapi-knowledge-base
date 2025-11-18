/**
 * Script to populate Pinecone with house listings data
 * 
 * This script reads the House Listings.txt file, creates embeddings,
 * and stores them in Pinecone for the knowledge base.
 */

const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
require('dotenv').config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'vapi-knowledge-base';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-ada-002';

if (!PINECONE_API_KEY || !OPENAI_API_KEY) {
  console.error('Error: PINECONE_API_KEY and OPENAI_API_KEY are required in .env file');
  process.exit(1);
}

// Initialize clients
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Parse house listings from the text file
 */
function parseHouseListings(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const listings = [];
  
  // Split by triple dashes (---)
  const sections = content.split('---').filter(section => section.trim());
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length < 2) continue;
    
    const listing = {
      title: '',
      content: '',
      metadata: {},
    };
    
    // Extract title (first line after ##)
    const titleMatch = section.match(/##\s*(.+)/);
    if (titleMatch) {
      listing.title = titleMatch[1].trim();
    }
    
    // Extract tags
    const tagsMatch = section.match(/tags:\s*(.+)/);
    if (tagsMatch) {
      listing.metadata.tags = tagsMatch[1].trim();
    }
    
    // Extract address
    const addressMatch = section.match(/- address:\s*(.+)/);
    if (addressMatch) {
      listing.metadata.address = addressMatch[1].trim();
    }
    
    // Extract price
    const priceMatch = section.match(/- price:\s*(.+)/);
    if (priceMatch) {
      listing.metadata.price = priceMatch[1].trim();
    }
    
    // Extract details
    const detailsMatch = section.match(/- details:\s*(.+)/);
    if (detailsMatch) {
      listing.metadata.details = detailsMatch[1].trim();
    }
    
    // Extract pets
    const petsMatch = section.match(/- pets:\s*(.+)/);
    if (petsMatch) {
      listing.metadata.pets = petsMatch[1].trim();
    }
    
    // Extract amenities
    const amenitiesMatch = section.match(/- amenities:\s*(.+)/);
    if (amenitiesMatch) {
      listing.metadata.amenities = amenitiesMatch[1].trim();
    }
    
    // Build content string for embedding
    listing.content = [
      listing.title,
      listing.metadata.address,
      listing.metadata.details,
      listing.metadata.price,
      listing.metadata.pets,
      listing.metadata.amenities,
      listing.metadata.tags,
    ].filter(Boolean).join('. ');
    
    if (listing.content) {
      listings.push(listing);
    }
  }
  
  return listings;
}

/**
 * Create embeddings in batches
 */
async function createEmbeddings(texts) {
  const batchSize = 100; // OpenAI allows up to 2048 inputs per request
  const embeddings = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`Creating embeddings for batch ${Math.floor(i / batchSize) + 1}...`);
    
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });
    
    embeddings.push(...response.data.map(item => item.embedding));
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return embeddings;
}

/**
 * Upsert vectors to Pinecone
 */
async function upsertVectors(index, vectors) {
  const batchSize = 100; // Pinecone batch limit
  
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    console.log(`Upserting batch ${Math.floor(i / batchSize) + 1}...`);
    
    await index.upsert(batch);
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function main() {
  try {
    console.log('🚀 Starting Pinecone population...\n');
    
    // Parse listings
    const filePath = path.join(__dirname, 'House Listings.txt');
    console.log(`Reading listings from: ${filePath}`);
    const listings = parseHouseListings(filePath);
    console.log(`Found ${listings.length} listings\n`);
    
    if (listings.length === 0) {
      console.error('No listings found. Please check the file format.');
      process.exit(1);
    }
    
    // Get Pinecone index
    console.log(`Connecting to Pinecone index: ${PINECONE_INDEX_NAME}`);
    const index = pinecone.index(PINECONE_INDEX_NAME);
    
    // Create embeddings
    console.log('\n📊 Creating embeddings...');
    const texts = listings.map(l => l.content);
    const embeddings = await createEmbeddings(texts);
    console.log(`✅ Created ${embeddings.length} embeddings\n`);
    
    // Prepare vectors for Pinecone
    console.log('📦 Preparing vectors for Pinecone...');
    const vectors = listings.map((listing, i) => ({
      id: `listing-${i + 1}-${Date.now()}`,
      values: embeddings[i],
      metadata: {
        content: listing.content,
        title: listing.title,
        address: listing.metadata.address || '',
        price: listing.metadata.price || '',
        details: listing.metadata.details || '',
        pets: listing.metadata.pets || '',
        amenities: listing.metadata.amenities || '',
        tags: listing.metadata.tags || '',
      },
    }));
    
    // Upsert to Pinecone
    console.log('\n💾 Uploading to Pinecone...');
    await upsertVectors(index, vectors);
    
    console.log(`\n✅ Successfully populated Pinecone with ${listings.length} listings!`);
    console.log(`\nIndex: ${PINECONE_INDEX_NAME}`);
    console.log(`You can now use this index with your Vapi knowledge base.`);
    
  } catch (error) {
    console.error('\n❌ Error populating Pinecone:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();

