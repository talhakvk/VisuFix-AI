function errorHandler(err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Max 10MB.' });
  }

  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: err.message });
  }

  // Dahili hataları logla ama istemciye detay sızdırma
  console.error('Internal Server Error:', err);
  return res.status(500).json({ error: 'Bir sunucu hatası oluştu.' });
}

module.exports = errorHandler;
