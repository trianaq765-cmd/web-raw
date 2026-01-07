const { getPastesCollection } = require('../lib/mongodb');
const { nanoid } = require('nanoid');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST - Buat paste baru
  if (req.method === 'POST') {
    try {
      const { content, title } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          error: 'Content tidak boleh kosong!' 
        });
      }

      const id = nanoid(8); // ID 8 karakter
      const paste = {
        id: id,
        title: title || 'Untitled',
        content: content,
        views: 0,
        createdAt: new Date()
      };

      const collection = await getPastesCollection();
      await collection.insertOne(paste);

      return res.status(201).json({
        success: true,
        data: {
          id: id,
          url: `/view/${id}`,
          rawUrl: `/raw/${id}`
        }
      });

    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Gagal menyimpan paste' 
      });
    }
  }

  return res.status(405).json({ error: 'Method tidak diizinkan' });
};
