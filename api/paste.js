const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { content, title } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, error: 'Content kosong!' });
    }

    // Cek ukuran (max 2MB)
    const sizeInBytes = Buffer.byteLength(content, 'utf8');
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    if (sizeInMB > 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'File terlalu besar! Maksimal 2MB.' 
      });
    }

    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('pastedb');
    const collection = db.collection('pastes');

    const id = generateId();
    const paste = {
      id: id,
      title: title || 'Untitled',
      content: content,
      size: sizeInBytes,
      views: 0,
      createdAt: new Date()
    };

    await collection.insertOne(paste);
    await client.close();

    return res.status(201).json({
      success: true,
      data: {
        id: id,
        url: '/view/' + id,
        rawUrl: '/raw/' + id,
        size: sizeInBytes
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
