import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '../styles/admin.module.css';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('add-manga');
  const [manga, setManga] = useState([]);
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Form states
  const [newMangaForm, setNewMangaForm] = useState({
    title: '',
    description: '',
    author: '',
    image_url: '',
    status: 'Ongoing',
  });

  const [uploadForm, setUploadForm] = useState({
    manga_id: '',
    chapter_number: '',
    title: '',
    file: null,
  });

  useEffect(() => {
    fetchMangaList();
  }, []);

  const fetchMangaList = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/manga?page=1`);
      setMangaList(response.data.manga);
    } catch (err) {
      console.error('Error fetching manga:', err);
    }
  };

  // Handle new manga submission
  const handleAddManga = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${apiUrl}/api/manga`, newMangaForm);
      setMessage('✅ Manga added successfully!');
      setNewMangaForm({
        title: '',
        description: '',
        author: '',
        image_url: '',
        status: 'Ongoing',
      });
      fetchMangaList();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Error adding manga'));
    } finally {
      setLoading(false);
    }
  };

  // Handle chapter upload
  const handleUploadChapter = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      setMessage('❌ Please select a file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('manga_id', uploadForm.manga_id);
      formData.append('chapter_number', uploadForm.chapter_number);
      formData.append('title', uploadForm.title || `Chapter ${uploadForm.chapter_number}`);
      formData.append('file', uploadForm.file);

      await axios.post(`${apiUrl}/api/chapters/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('✅ Chapter uploaded successfully!');
      setUploadForm({
        manga_id: '',
        chapter_number: '',
        title: '',
        file: null,
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.error || 'Error uploading chapter'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.homeBtn}>← Home</Link>
        <h1>Admin Panel</h1>
        <div></div>
      </nav>

      <div className={styles.tabs}>
        <button
          className={activeTab === 'add-manga' ? styles.active : ''}
          onClick={() => setActiveTab('add-manga')}
        >
          Add Manga
        </button>
        <button
          className={activeTab === 'upload-chapter' ? styles.active : ''}
          onClick={() => setActiveTab('upload-chapter')}
        >
          Upload Chapter
        </button>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.content}>
        {/* Add Manga Tab */}
        {activeTab === 'add-manga' && (
          <div className={styles.form}>
            <h2>Add New Manga</h2>
            <form onSubmit={handleAddManga}>
              <input
                type="text"
                placeholder="Title"
                value={newMangaForm.title}
                onChange={(e) => setNewMangaForm({ ...newMangaForm, title: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Author"
                value={newMangaForm.author}
                onChange={(e) => setNewMangaForm({ ...newMangaForm, author: e.target.value })}
              />
              <textarea
                placeholder="Description"
                value={newMangaForm.description}
                onChange={(e) => setNewMangaForm({ ...newMangaForm, description: e.target.value })}
                rows="4"
              />
              <input
                type="url"
                placeholder="Image URL (e.g., https://example.com/image.jpg)"
                value={newMangaForm.image_url}
                onChange={(e) => setNewMangaForm({ ...newMangaForm, image_url: e.target.value })}
              />
              <select
                value={newMangaForm.status}
                onChange={(e) => setNewMangaForm({ ...newMangaForm, status: e.target.value })}
              >
                <option>Ongoing</option>
                <option>Completed</option>
                <option>Hiatus</option>
                <option>Dropped</option>
              </select>
              <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Manga'}
              </button>
            </form>
          </div>
        )}

        {/* Upload Chapter Tab */}
        {activeTab === 'upload-chapter' && (
          <div className={styles.form}>
            <h2>Upload Chapter</h2>
            <form onSubmit={handleUploadChapter}>
              <select
                value={uploadForm.manga_id}
                onChange={(e) => setUploadForm({ ...uploadForm, manga_id: e.target.value })}
                required
              >
                <option value="">Select Manga</option>
                {mangaList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Chapter Number"
                min="1"
                step="0.5"
                value={uploadForm.chapter_number}
                onChange={(e) => setUploadForm({ ...uploadForm, chapter_number: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Chapter Title (optional)"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              />
              <input
                type="file"
                accept=".pdf,.zip,.rar,.cbz,.cbr"
                onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                required
              />
              <p className={styles.fileInfo}>Supported: PDF, ZIP, RAR, CBZ, CBR</p>
              <button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Chapter'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
