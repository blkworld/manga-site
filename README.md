# MangaHub - Full Stack Manga Website

A complete manga website with admin panel for uploading chapters. Built with React + Next.js (frontend) and Express + PostgreSQL (backend).

## Project Structure

```
manga-site-full/
├── backend/          # Express server
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── uploads/     # Chapter files stored here
├── frontend/         # Next.js app
│   ├── pages/
│   ├── styles/
│   ├── package.json
│   ├── next.config.js
│   └── .env.local.example
└── README.md
```

---

## Quick Setup (GitHub Codespaces)

### 1. Create GitHub Codespace
1. Go to your GitHub repo
2. Click **Code** → **Codespaces** → **Create codespace on main**
3. Wait for the environment to load

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database URL
# Leave as localhost for local testing
nano .env
```

**Local testing `.env`:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/manga_db
PORT=5000
NODE_ENV=development
```

### 3. Setup Database (Local Testing)

If you have PostgreSQL running locally:
```bash
# Create database
createdb manga_db

# Start backend
npm run dev
# Server runs on http://localhost:5000
```

### 4. Setup Frontend

In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.local.example .env.local

# For local development, .env.local is already correct:
# NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
# App runs on http://localhost:3000
```

---

## Deploy to Production

### Backend → Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - New Project → Database → PostgreSQL
   - Copy connection URL

3. **Deploy Backend**
   - New Project → GitHub Repo (select your repo)
   - Configure environment:
     ```
     DATABASE_URL=<paste from Railway PostgreSQL>
     NODE_ENV=production
     PORT=5000
     ```
   - Railway auto-deploys on git push

4. **Get Backend URL**
   - Go to Deployments → Your backend service
   - Copy the public URL (e.g., `https://manga-backend-production.up.railway.app`)

### Frontend → Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy from GitHub**
   - New Project → Select your repository → Import
   - Select `frontend` as root directory

3. **Configure Environment Variables**
   - Environment Variables → Add:
     ```
     NEXT_PUBLIC_API_URL=https://manga-backend-production.up.railway.app
     ```
   - Replace with your actual Railway backend URL

4. **Deploy**
   - Click Deploy
   - Vercel auto-deploys on git push

---

## API Endpoints

### Manga
- `GET /api/manga?page=1` - Get paginated manga list
- `GET /api/manga/search?q=title` - Search manga
- `GET /api/manga/:id` - Get manga details with chapters
- `POST /api/manga` - Add new manga (admin)

### Chapters
- `POST /api/chapters/upload` - Upload chapter file (multipart form)
- `GET /api/manga/:id/chapters` - Get chapters for manga
- `GET /api/chapters/:id/download` - Download chapter file
- `DELETE /api/chapters/:id` - Delete chapter (admin)

---

## Admin Panel

Access at: `http://localhost:3000/admin` (or your deployed frontend URL)

### Add Manga
- Title, Author, Description, Image URL, Status
- Creates manga entry in database

### Upload Chapter
1. Select manga from dropdown
2. Enter chapter number (e.g., 1, 1.5, 2)
3. Enter optional chapter title
4. Upload file (PDF, ZIP, RAR, CBZ, CBR)
5. Files stored on backend server

---

## Local Testing Without Database

**For quick testing without PostgreSQL:**

Replace the database connection in `backend/server.js` with a mock:

```javascript
// Temporary: comment out real database
// const pool = new pg.Pool({ ... });

// Use in-memory storage for testing
const mockManga = [];
const mockChapters = [];

app.get('/api/manga', (req, res) => {
  res.json({ manga: mockManga, total: 0, pages: 1 });
});
```

This lets you test the UI without setup, but uploads won't persist.

---

## Troubleshooting

### "Cannot connect to database"
- Ensure PostgreSQL is running locally
- Check DATABASE_URL is correct
- For Railway: copy the full connection URL from Railway dashboard

### "CORS error" in frontend
- Backend CORS is already enabled in `server.js`
- Check `NEXT_PUBLIC_API_URL` matches backend URL
- For local: `http://localhost:5000`
- For production: Railway backend URL

### Uploads failing
- Check file size (Railway has limits on free tier)
- Ensure `uploads/` directory exists on backend
- For production: Use S3 instead of local filesystem

### "Next.js build errors"
- Delete `frontend/.next/` folder
- Run `npm run build` again

---

## Environment Variables Summary

### Backend (.env)
```
DATABASE_URL=postgresql://...
PORT=5000
NODE_ENV=development|production
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000  # local
# or
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app  # production
```

---

## Next Steps for Production

1. **Use S3 for file storage** instead of local filesystem (Railway doesn't persist files)
   - Install: `npm install aws-sdk`
   - Modify chapter upload endpoint

2. **Add authentication** to admin panel
   - Use JWT tokens
   - Protect upload endpoints

3. **Add image optimization** for manga covers
   - Use Next.js Image component

4. **Monitor uploads** with file validation
   - Validate file types, size limits
   - Scan for malware

5. **Backups** for PostgreSQL
   - Railway auto-backups (paid tier)
   - Manual exports recommended

---

## Commands Reference

**Backend:**
```bash
npm install      # Install dependencies
npm run dev      # Local development
npm start        # Production mode
```

**Frontend:**
```bash
npm install      # Install dependencies
npm run dev      # Local development
npm run build    # Build for production
npm start        # Start production server
```

---

**Built with:** React, Next.js, Express, PostgreSQL, Multer, Axios
