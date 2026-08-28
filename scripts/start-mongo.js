const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Starting MongoDB Memory Server...');
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017, // use default port or random
      dbName: 'bhavatsyam'
    }
  });

  const uri = mongod.getUri();
  console.log(`MongoDB Memory Server started at: ${uri}`);

  const envPath = path.join(__dirname, '../.env.local');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Replace or add MONGODB_URI
  const uriLine = `MONGODB_URI=${uri}`;
  if (envContent.includes('MONGODB_URI=')) {
    envContent = envContent.replace(/MONGODB_URI=.*/, uriLine);
  } else {
    envContent += `\n${uriLine}`;
  }

  const envLines = envContent.split('\n');
  const linesToAdd = [
    { key: 'NEXTAUTH_SECRET', line: `NEXTAUTH_SECRET=secret123` },
    { key: 'NEXT_PUBLIC_RAZORPAY_KEY_ID', line: `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_mockKeyId123` },
    { key: 'RAZORPAY_KEY_ID', line: `RAZORPAY_KEY_ID=rzp_test_mockKeyId123` },
    { key: 'RAZORPAY_KEY_SECRET', line: `RAZORPAY_KEY_SECRET=mockKeySecret1234567890` },
    { key: 'RAZORPAY_WEBHOOK_SECRET', line: `RAZORPAY_WEBHOOK_SECRET=mockWebhookSecret123456` }
  ];

  for (const item of linesToAdd) {
    const exists = envLines.some(line => line.trim().startsWith(`${item.key}=`));
    if (!exists) {
      envLines.push(item.line);
    }
  }

  fs.writeFileSync(envPath, envLines.join('\n').trim() + '\n', 'utf8');
  console.log(`Updated .env.local with MONGODB_URI`);

  // Handle termination signals
  process.on('SIGINT', async () => {
    console.log('Stopping MongoDB Memory Server...');
    await mongod.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Stopping MongoDB Memory Server...');
    await mongod.stop();
    process.exit(0);
  });

  // Keep process alive
  setInterval(() => {}, 1000);
}

main().catch((err) => {
  console.error('Error starting memory server:', err);
  process.exit(1);
});
