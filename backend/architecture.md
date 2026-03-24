# Backend Mimarisi (VisuFix AI)

## Teknoloji Yığını

- **Runtime:** Node.js
- **Framework:** Express.js
- **Veritabanı:** SQLite
- **Dosya Yükleme:** Multer
- **AI Entegrasyonu:** Gemini Vision API (görüntü analizi ve koordinat üretimi)

## Klasör Yapısı
backend/
├── src/
│   ├── config/          # Veritabanı ve Gemini API yapılandırmaları
│   ├── controllers/     # İstek işleyicileri (örn: faultController)
│   ├── middlewares/     # Hata yönetimi, multer ile dosya yükleme
│   ├── models/          # SQLite veritabanı sorguları (Repository mantığı)
│   ├── routes/          # API rotaları (faultRoutes)
│   ├── services/        # Gemini Vision API entegrasyonu (geminiService)
│   ├── utils/           # Yardımcı fonksiyonlar (örn: prompt oluşturucu)
│   └── app.js           # Express uygulama giriş noktası
├── uploads/             # Mobilden yüklenen arıza fotoğrafları
├── .env.example
├── package.json
└── server.js            # Sunucu başlatma

## API Endpoint'leri

### Arıza Yönetimi (Faults)

| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| POST | `/api/faults` | Yeni arıza fotoğrafı yükle ve Gemini analizini başlat |
| GET | `/api/faults` | Tüm arıza kayıtlarını listele (Web Paneli için) |
| GET | `/api/faults/:id` | Belirli bir arızanın detayını getir |
| DELETE| `/api/faults/:id` | Geçmiş bir arızayı sil |

### Simülasyon Adımları (Steps)

| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| GET | `/api/faults/:id/steps` | Belirli bir arızaya ait X, Y koordinatlarını ve talimatları listele |

## Mimari Diyagram

```text
┌──────────┐     ┌──────────────┐     ┌────────────┐
│  Mobile  │────▶│   Express    │────▶│   SQLite   │
│  & Web   │◀────│   REST API   │◀────│  Database  │
└──────────┘     └──────┬───────┘     └────────────┘
                        │
                 ┌──────▼───────┐
                 │    Gemini    │
                 │  Vision API  │
                 └──────────────┘