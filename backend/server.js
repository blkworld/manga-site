const express = require('express');
const pg = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mangaDir = path.join(uploadsDir, req.body.manga_id);
    if (!fs.existsSync(mangaDir)) {
      fs.mkdirSync(mangaDir, { recursive: true });
    }
    cb(null, mangaDir);
  },
  filename: (req, file, cb) => {
    cb(null, `chapter-${req.body.chapter_number}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Initialize database tables
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manga (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        author VARCHAR(255),
        image_url VARCHAR(255),
        status VARCHAR(50),
        rating DECIMAL(3,1) DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chapters (
        id SERIAL PRIMARY KEY,
        manga_id INT REFERENCES manga(id) ON DELETE CASCADE,
        chapter_number INT NOT NULL,
        title VARCHAR(255),
        file_path VARCHAR(255),
        file_size INT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(manga_id, chapter_number)
      )
    `);

    console.log('Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

initDB();

// ========== MANGA ENDPOINTS ==========

// Get all manga with pagination
app.get('/api/manga', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM manga ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM manga');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      manga: result.rows,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});

// Search manga
app.get('/api/manga/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const result = await pool.query(
      "SELECT * FROM manga WHERE LOWER(title) LIKE LOWER($1) ORDER BY created_at DESC LIMIT 20",
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get single manga with chapters
app.get('/api/manga/:id', async (req, res) => {
  try {
    const mangaResult = await pool.query('SELECT * FROM manga WHERE id = $1', [req.params.id]);
    if (mangaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Manga not found' });
    }

    const chaptersResult = await pool.query(
      'SELECT * FROM chapters WHERE manga_id = $1 ORDER BY chapter_number ASC',
      [req.params.id]
    );

    res.json({
      ...mangaResult.rows[0],
      chapters: chaptersResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});

// Add new manga
app.post('/api/manga', async (req, res) => {
  try {
    const { title, description, author, image_url, status } = req.body;
    const result = await pool.query(
      'INSERT INTO manga (title, description, author, image_url, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, author, image_url, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create manga' });
  }
});

// ========== CHAPTER ENDPOINTS ==========

// Upload chapter file
app.post('/api/chapters/upload', upload.single('file'), async (req, res) => {
  try {
    const { manga_id, chapter_number, title } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const filePath = path.join('uploads', manga_id, req.file.filename);

    const result = await pool.query(
      'INSERT INTO chapters (manga_id, chapter_number, title, file_path, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [manga_id, chapter_number, title || `Chapter ${chapter_number}`, filePath, req.file.size]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload chapter' });
  }
});

// Get chapters for manga
app.get('/api/manga/:id/chapters', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM chapters WHERE manga_id = $1 ORDER BY chapter_number ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Download chapter file
app.get('/api/chapters/:id/download', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chapters WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const filePath = path.join(__dirname, result.rows[0].file_path);
    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to download chapter' });
  }
});

// Delete chapter
app.delete('/api/chapters/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chapters WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const filePath = path.join(__dirname, result.rows[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM chapters WHERE id = $1', [req.params.id]);
    res.json({ message: 'Chapter deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
