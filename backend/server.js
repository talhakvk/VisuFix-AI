require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDB } = require('./src/config/database');
const app = require('./src/app');

// uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Veritabanını başlat
initDB();

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VisuFix API running on port ${PORT}`);
});
