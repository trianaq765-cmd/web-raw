const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!uri) {
  throw new Error('MONGODB_URI tidak ditemukan di environment variables!');
}

client = new MongoClient(uri);
clientPromise = client.connect();

async function getDatabase() {
  const client = await clientPromise;
  return client.db('pastedb');
}

async function getPastesCollection() {
  const db = await getDatabase();
  return db.collection('pastes');
}

module.exports = { getDatabase, getPastesCollection };
