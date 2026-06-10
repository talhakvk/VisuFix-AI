<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />
</p>

# 🔧 VisuFix AI

**Yapay zeka destekli görsel arıza tespit ve onarım rehberi.**

VisuFix AI, kullanıcıların bozulan elektronik cihazlarının (bilgisayar kasası, modem, yazıcı vb.) fotoğrafını çekerek, yapay zekanın yönlendirmesiyle adım adım onarım yapmasını sağlayan bir uygulamadır. Google Gemini Vision API kullanarak fotoğraf üzerindeki arızaları otomatik olarak tespit eder ve her arıza noktasını koordinat bazlı görsel işaretleyicilerle ekrana yansıtır.

---

## 🎯 Problem ve Motivasyon

Kullanıcılar bozulan cihazlarına müdahale ederken, geleneksel statik kullanma kılavuzlarının karmaşıklığı nedeniyle doğru adımları bulamaz ve cihaza yanlış müdahale etme riski taşır. Her cihazın yapısı farklı olduğu için, genel geçer yazılı talimatlar yetersiz kalmaktadır.

**VisuFix AI**, kullanıcının **kendi çektiği fotoğraf** üzerinden kişiselleştirilmiş ve görsel bir onarım rehberi sunarak bu sorunu çözer.

---

## ✨ Temel Özellikler

| Özellik | Açıklama |
|---------|----------|
| 📸 **Fotoğraf ile Arıza Tespiti** | Kamera veya galeriden yüklenen cihaz fotoğrafını Gemini AI ile analiz eder |
| 🎯 **Koordinat Bazlı İşaretleme** | Arıza noktalarını fotoğraf üzerinde hassas koordinatlarla gösterir |
| 🔴 **AR Tarzı Görsel İşaretleyiciler** | Pulse animasyonlu marker'larla arıza noktalarını vurgular |
| 📋 **Adım Adım Onarım Rehberi** | Her arıza için detaylı açıklama ve çözüm önerisi sunar |
| 📱 **Mobil Uygulama** | React Native (Expo) ile geliştirilmiş, iOS ve Android uyumlu |
| 🖥️ **Web Admin Paneli** | Tüm arıza kayıtlarını yönetmek için modern dashboard |
| 🗄️ **RESTful API** | Express.js tabanlı tam CRUD API |

---

## 📱 Mobil Uygulama Ekran Görüntüleri

<p align="center">
  <img src="screenshots/mobile-1.png" width="250" alt="Kamera Ekranı" />
  &nbsp;&nbsp;
  <img src="screenshots/mobile-2.png" width="250" alt="Analiz Sonucu" />
  &nbsp;&nbsp;
  <img src="screenshots/mobile-3.png" width="250" alt="Onarım Adımları" />
</p>

<!-- 
  Yukarıdaki görselleri eklemek için:
  1. Proje kök dizininde "screenshots" klasörü oluşturun
  2. Mobil uygulamanın ekran görüntülerini bu klasöre kaydedin
  3. Dosya isimlerini yukarıdaki isimlere göre düzenleyin
-->

---

## 🖥️ Web Admin Paneli Ekran Görüntüleri

<p align="center">
  <img src="screenshots/web-dashboard.png" width="800" alt="Dashboard" />
</p>

<p align="center">
  <img src="screenshots/web-detail.png" width="800" alt="Arıza Detay Sayfası" />
</p>

<!-- 
  Yukarıdaki görselleri eklemek için:
  1. Proje kök dizininde "screenshots" klasörü oluşturun
  2. Web panelinin ekran görüntülerini bu klasöre kaydedin
  3. Dosya isimlerini yukarıdaki isimlere göre düzenleyin
-->

---

## 🏗️ Mimari

```
┌─────────────────┐         ┌──────────────────┐         ┌────────────┐
│   📱 Mobile     │         │   🖥️ Express.js   │         │  🗄️ SQLite  │
│  React Native   │────────▶│    REST API       │────────▶│  Database  │
│    (Expo)       │◀────────│   Port: 3000      │◀────────│            │
└─────────────────┘         └────────┬─────────┘         └────────────┘
                                     │
┌─────────────────┐                  │
│   🌐 Web        │                  │
│  Admin Panel    │─────────────────▶│
│  (HTML/JS/CSS)  │                  │
└─────────────────┘         ┌────────▼─────────┐
                            │   🤖 Google       │
                            │   Gemini AI       │
                            │   Vision API      │
                            └──────────────────┘
```

---

## 🛠️ Teknoloji Yığını

### Backend
| Teknoloji | Kullanım Amacı |
|-----------|---------------|
| **Node.js** | Sunucu tarafı çalışma ortamı |
| **Express.js** | RESTful API framework |
| **SQLite** (better-sqlite3) | Hafif ilişkisel veritabanı |
| **Multer** | Dosya yükleme middleware |
| **Google Generative AI** | Gemini Vision API entegrasyonu |

### Mobil
| Teknoloji | Kullanım Amacı |
|-----------|---------------|
| **React Native** | Cross-platform mobil uygulama |
| **Expo** (SDK 54) | Geliştirme ve derleme araçları |
| **React Navigation** | Ekranlar arası navigasyon |
| **Expo Image Picker** | Kamera ve galeri erişimi |
| **Axios** | HTTP istemcisi |

### Web
| Teknoloji | Kullanım Amacı |
|-----------|---------------|
| **HTML5 / CSS3** | Sayfa yapısı ve stillendirme |
| **Vanilla JavaScript** | İstemci tarafı mantık |
| **Tailwind CSS** (CDN) | Yardımcı CSS sınıfları |

---

## 📂 Proje Yapısı

```
VisuFix-AI/
│
├── backend/                    # Node.js API Sunucusu
│   ├── src/
│   │   ├── config/             # Veritabanı yapılandırması
│   │   ├── controllers/        # İstek işleyicileri
│   │   ├── middlewares/        # Hata yönetimi, dosya yükleme
│   │   ├── models/             # SQLite sorguları (Repository)
│   │   ├── routes/             # API rotaları
│   │   ├── services/           # Gemini AI servisi
│   │   ├── utils/              # Prompt oluşturucu
│   │   └── app.js              # Express uygulama
│   ├── uploads/                # Yüklenen arıza fotoğrafları
│   ├── .env.example            # Ortam değişkenleri şablonu
│   ├── package.json
│   └── server.js               # Sunucu giriş noktası
│
├── mobile/                     # React Native Mobil Uygulama
│   ├── src/
│   │   ├── api/                # Backend API istekleri
│   │   ├── components/         # MarkerOverlay, StepCard
│   │   ├── constants/          # Yapılandırma sabitleri
│   │   ├── screens/            # CameraScreen, SimulationScreen
│   │   └── theme/              # Tema dosyaları
│   ├── App.js                  # Uygulama giriş noktası
│   ├── .env.example            # Ortam değişkenleri şablonu
│   └── package.json
│
├── web/                        # Web Admin Paneli
│   ├── css/style.css           # Özel stiller
│   ├── js/
│   │   ├── api.js              # API katmanı
│   │   ├── dashboard.js        # Dashboard mantığı
│   │   └── detail.js           # Arıza detay sayfası
│   ├── index.html              # Dashboard sayfası
│   └── detail.html             # Arıza detay sayfası
│
├── database/                   # Veritabanı dokümanları
│   ├── schema.sql              # Tablo şemaları
│   └── er-diagram.png          # ER diyagramı
│
├── docs/                       # Proje dokümanları
│   ├── problem-definition-scope.md
│   ├── use-cases.md
│   ├── mobile-wireframes/
│   └── web-wireframes/
│
├── .gitignore
└── README.md
```

---

## 🚀 Kurulum

### Gereksinimler

- **Node.js** v18 veya üstü
- **npm** v9 veya üstü
- **Expo CLI** (`npm install -g expo-cli`)
- **Google Gemini API Anahtarı** → [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Repoyu Klonlayın

```bash
git clone https://github.com/talhakvk/VisuFix-AI.git
cd VisuFix-AI
```

### 2. Backend Kurulumu

```bash
cd backend
npm install
```

`.env` dosyasını oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyerek Gemini API anahtarınızı girin:

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```

Backend'i başlatın:

```bash
npm start
```

> Sunucu `http://localhost:3000` adresinde çalışacaktır.

### 3. Mobil Uygulama Kurulumu

```bash
cd mobile
npm install
```

`.env` dosyasını oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyerek bilgisayarınızın yerel IP adresini girin:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:3000
```

> ⚠️ `localhost` mobil cihazlarda çalışmaz. `ipconfig` (Windows) veya `ifconfig` (Mac/Linux) komutuyla yerel IP adresinizi bulun.

Uygulamayı başlatın:

```bash
npx expo start
```

### 4. Web Admin Paneli

Web paneli statik dosyalardan oluşmaktadır. Herhangi bir HTTP sunucusuyla çalıştırabilirsiniz:

```bash
cd web
# VS Code kullanıyorsanız Live Server eklentisi ile açabilirsiniz
# veya:
npx serve .
```

> Backend sunucusunun `http://localhost:3000` adresinde çalıştığından emin olun.

---

## 📡 API Dokümantasyonu

### Arıza Yönetimi

| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| `POST` | `/api/faults` | Fotoğraf yükle ve AI analizi başlat |
| `GET` | `/api/faults` | Tüm arıza kayıtlarını listele |
| `GET` | `/api/faults/:id` | Arıza detayını getir |
| `DELETE` | `/api/faults/:id` | Arıza kaydını sil |

### Onarım Adımları

| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| `GET` | `/api/faults/:id/steps` | Arızaya ait onarım adımlarını listele |

### Örnek İstek — Fotoğraf Yükleme

```bash
curl -X POST http://localhost:3000/api/faults \
  -F "photo=@./cihaz-fotografi.jpg"
```

### Örnek Yanıt

```json
{
  "fault": {
    "id": 1,
    "photo_url": "uploads/1780658454433.jpg",
    "status": "analyzed",
    "created_at": "2026-06-10 07:00:54"
  },
  "steps": [
    {
      "id": 1,
      "fault_id": 1,
      "step_order": 1,
      "coord_x": 45.2,
      "coord_y": 30.8,
      "description": "Sağ üst köşedeki vida kırılmış. Phillips tornavida ile çıkarılıp yenisiyle değiştirilmeli."
    }
  ]
}
```

---

## 🗄️ Veritabanı Şeması

```sql
CREATE TABLE faults (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    photo_url  TEXT     NOT NULL,
    status     TEXT     DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE steps (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    fault_id    INTEGER NOT NULL,
    step_order  INTEGER NOT NULL,
    coord_x     REAL    NOT NULL,
    coord_y     REAL    NOT NULL,
    description TEXT    NOT NULL,
    FOREIGN KEY (fault_id) REFERENCES faults(id) ON DELETE CASCADE
);
```

---

## 📄 Lisans

Bu proje [ISC](https://opensource.org/licenses/ISC) lisansı altında sunulmaktadır.
