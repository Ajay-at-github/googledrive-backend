require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const indexes = await mongoose.connection.db.collection('activationtokens').indexes();
  console.log('\n📋 Current indexes on activationtokens:');
  console.log(JSON.stringify(indexes, null, 2));
  
  await mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
