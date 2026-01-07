const { getPastesCollection } = require('../lib/mongodb');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  try {
    const { id } = req.query;

    const collection = await getPastesCollection();
    const paste = await collection.findOne({ id: id });

    if (!paste) {
      return res.status(404).json({ 
        success: false, 
        error: 'Paste tidak ditemukan' 
      });
    }

    // Update view count
    await collection.updateOne(
      { id: id },
      { $inc: { views: 1 } }
    );

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
    return res.status(500).json({ 
      success: false, 
      error: 'Gagal mengambil paste' 
    });
  }
};
