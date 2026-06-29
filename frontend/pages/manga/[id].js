import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/manga-detail.module.css';

export default function MangaDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!id) return;
    fetchMangaDetail();
  }, [id]);

  const fetchMangaDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/manga/${id}`);
      setManga(response.data);
      setChapters(response.data.chapters || []);
    } catch (err) {
      console.error('Error fetching manga:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!manga) return <div className={styles.notFound}>Manga not found</div>;

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.backBtn}>← Back to Home</Link>
      </nav>

      <div className={styles.header}>
        <img 
          src={manga.image_url || 'https://via.placeholder.com/300x450?text=No+Image'} 
          alt={manga.title}
          className={styles.coverImage}
        />
        <div className={styles.info}>
          <h1>{manga.title}</h1>
          <p className={styles.author}>By {manga.author || 'Unknown'}</p>
          <p className={styles.status}>Status: {manga.status}</p>
          <p className={styles.rating}>Rating: ⭐ {manga.rating || '0.0'}</p>
          <p className={styles.description}>{manga.description}</p>
        </div>
      </div>

      <div className={styles.chaptersSection}>
        <h2>Chapters ({chapters.length})</h2>
        {chapters.length === 0 ? (
          <p className={styles.noChapters}>No chapters available yet</p>
        ) : (
          <div className={styles.chaptersList}>
            {chapters.map((chapter) => (
              <div key={chapter.id} className={styles.chapterItem}>
                <div className={styles.chapterInfo}>
                  <h3>Chapter {chapter.chapter_number}</h3>
                  <p>{chapter.title}</p>
                  <small>Size: {(chapter.file_size / 1024 / 1024).toFixed(2)} MB</small>
                </div>
                <a 
                  href={`${apiUrl}/api/chapters/${chapter.id}/download`}
                  className={styles.downloadBtn}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
