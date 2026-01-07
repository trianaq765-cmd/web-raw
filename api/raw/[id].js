const { getPastesCollection } = require('../../lib/mongodb');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method tidak diizinkan');
  }

  try {
    const { id } = req.query;

    const collection = await getPastesCollection();
    const paste = await collection.findOne({ id: id });

    if (!paste) {
      return res.status(404).send('-- Paste tidak ditemukan');
    }

    // Update view count
    await collection.updateOne(
      { id: id },
      { $inc: { views: 1 } }
    );

    // Return sebagai plain text (untuk loadstring Roblox)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(paste.content);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('-- Error server');
  }
};
