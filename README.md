# Ruang Kritik

Forum diskusi terbuka berbasis React.js + Supabase untuk menyuarakan kritik dan aspirasi.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Database & Auth**: Supabase
- **Storage**: Supabase Storage
- **Deploy**: GitHub Pages

## ⚡ Setup Lokal

### 1. Install Dependencies
```bash
npm install
```

### 2. Konfigurasi Supabase
Buat file `.env` di root project:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Setup Database
Buka Supabase Dashboard → SQL Editor → jalankan isi file `supabase_schema.sql`

### 4. Jalankan Dev Server
```bash
npm run dev
```

## 🌐 Deploy ke GitHub Pages

### 1. Buat Repo GitHub
Buat repo baru dengan nama `kritik`

### 2. Sesuaikan vite.config.js
```js
base: '/kritik/', // nama repo GitHub kamu
```

### 3. Tambahkan homepage di package.json
```json
"homepage": "https://username-github.github.io/kritik"
```

### 4. Push & Deploy
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/username/kritik.git
git push -u origin main

npm run deploy
```

## 📁 Struktur Project

```
src/
├── lib/supabase.js          # Supabase client
├── context/AuthContext.jsx  # Auth state global
├── components/
│   ├── Navbar.jsx
│   ├── TopicCard.jsx
│   ├── CommentCard.jsx
│   └── ProtectedRoute.jsx
└── pages/
    ├── Home.jsx             # /
    ├── Login.jsx            # /login
    ├── Register.jsx         # /register
    ├── CreateTopic.jsx      # /create-topic
    ├── TopicDetail.jsx      # /topic/:id
    └── Profile.jsx          # /profile
```

## 🛠️ Fitur

- ✅ Register & Login via Supabase Auth
- ✅ Buat topik baru dengan gambar
- ✅ Like topik & komentar
- ✅ Reply (komentar) dengan gambar
- ✅ Filter berdasarkan kategori
- ✅ Pencarian topik
- ✅ Profil pengguna
- ✅ Dark mode premium
- ✅ Responsive (mobile-first)
