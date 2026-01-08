const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, error: 'ID required' });
    }

    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('pastedb');
    const collection = db.collection('pastes');

    const paste = await collection.findOne({ id: id });

    if (!paste) {
      await client.close();
      return res.status(404).json({ success: false, error: 'Paste not found' });
    }

    await collection.updateOne({ id: id }, { $inc: { views: 1 } });
    await client.close();

    return res.status(200).json({
      success: true,
      data: {
        id: paste.id,
        title: paste.title,
        content: paste.content,
        views: paste.views + 1,
        createdAt: paste.createdAt
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
