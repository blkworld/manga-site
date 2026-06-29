# Getting Started - MangaHub

## 📋 Quick Checklist

- [ ] Clone/download the project
- [ ] Run setup script or manual setup
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Test locally at http://localhost:3000

---

## 🚀 Option 1: Automated Setup (Recommended)

```bash
# From project root
bash setup.sh
```

This will:
1. Copy `.env.example` to `.env` and `.env.local`
2. Install all dependencies
3. Print next steps

---

## 🔧 Option 2: Manual Setup

### Terminal 1 - Backend
```bash
cd backend
cp .env.example .env
nano .env  # Edit with your database URL (localhost for testing)
npm install
npm run dev
```

Expected output:
```
Server running on port 5000
Database initialized
```

### Terminal 2 - Frontend
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Expected output:
```
> Local:        http://localhost:3000
```

---

## 🌐 Test Locally

1. **Open http://localhost:3000** - You should see the manga grid (empty at first)
2. **Go to http://localhost:3000/admin** - Add manga and upload chapters
3. **Add a manga first**, then upload chapters to it

---

## 🚢 Deploy (When Ready)

### Backend to Railway
1. Push code to GitHub
2. Create Railway project from GitHub
3. Add PostgreSQL database
4. Set `DATABASE_URL` and deploy
5. Copy Railway backend URL

### Frontend to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Set `NEXT_PUBLIC_API_URL` to Railway backend URL
4. Deploy

See full instructions in README.md

---

## ❌ Common Issues

**"Cannot connect to database"**
- Add PostgreSQL connection string to `.env`
- Or use Railway database for testing

**"API not connecting"**
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Make sure backend is running on port 5000

**"Upload fails"**
- Backend needs `uploads/` folder (auto-created)
- Check file permissions on server

---

## 📂 File Structure You Need to Know

```
backend/
├── server.js          ← Main API server
├── package.json
├── .env               ← Your database config (create from .env.example)
└── uploads/           ← Uploaded chapters stored here

frontend/
├── pages/
│   ├── index.js       ← Home page (manga grid)
│   ├── admin.js       ← Upload/add manga
│   └── manga/[id].js  ← Manga detail page
├── styles/            ← CSS modules
├── package.json
└── .env.local         ← API URL config
```

---

## 🎯 What to Do First

1. **Test add manga** in admin panel
2. **Upload a PDF/ZIP file** as a chapter
3. **Check if it shows** on manga detail page
4. If working → Ready to deploy!

---

Need help? Check README.md for detailed deployment and troubleshooting.
