require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const collection = mongoose.connection.db.collection('activationtokens');
    
    console.log('📋 Listing current indexes...');
    const indexes = await collection.indexes();
    indexes.forEach((idx, i) => {
      console.log(`  ${i + 1}. ${idx.name}:`, idx.key, idx.expireAfterSeconds ? `(TTL: ${idx.expireAfterSeconds}s)` : '');
    });
    
    console.log('\n🗑️  Dropping ALL indexes (except _id)...');
    try {
      await collection.dropIndexes();
      console.log('✅ Dropped successfully\n');
    } catch (err) {
      console.log('⚠️  Drop failed (might be empty):', err.message, '\n');
    }
    
    console.log('✏️  Creating new token index (unique, NO TTL)...');
    await collection.createIndex({ token: 1 }, { unique: true });
    console.log('✅ Created\n');
    
    console.log('📋 Final indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach((idx, i) => {
      console.log(`  ${i + 1}. ${idx.name}:`, idx.key, idx.expireAfterSeconds ? `(TTL: ${idx.expireAfterSeconds}s)` : '');
    });
    
    console.log('\n✅ DONE! Now restart your server (Ctrl+C in nodemon terminal, then run again)\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

fixIndexes();

