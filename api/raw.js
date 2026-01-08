const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).send('-- ID required');
    }

    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('pastedb');
    const collection = db.collection('pastes');

    const paste = await collection.findOne({ id: id });

    if (!paste) {
      await client.close();
      return res.status(404).send('-- Paste not found');
    }

    await collection.updateOne({ id: id }, { $inc: { views: 1 } });
    await client.close();

    return res.status(200).send(paste.content);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('-- Server error: ' + error.message);
  }
};
