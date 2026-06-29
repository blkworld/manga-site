import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '../styles/home.module.css';

export default function Home() {
  const [manga, setManga] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchManga(currentPage);
  }, [currentPage]);

  const fetchManga = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/manga?page=${page}`);
      setManga(response.data.manga);
      setTotalPages(response.data.pages);
    } catch (err) {
      console.error('Error fetching manga:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchManga(1);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/manga/search?q=${searchQuery}`);
      setManga(response.data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <h1>⭐ MangaHub</h1>
        </div>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search manga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>
        <Link href="/admin" className={styles.adminBtn}>
          Admin Panel
        </Link>
      </nav>

      <main className={styles.main}>
        <h2>Popular Manga</h2>
        
        {loading && <p className={styles.loading}>Loading...</p>}

        <div className={styles.grid}>
          {manga.map((item) => (
            <Link href={`/manga/${item.id}`} key={item.id}>
              <div className={styles.card}>
                <div className={styles.imageContainer}>
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/150x220?text=No+Image'} 
                    alt={item.title}
                  />
                  <div className={styles.rating}>
                    ⭐ {item.rating || '0.0'}
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h3>{item.title}</h3>
                  <p className={styles.author}>{item.author || 'Unknown'}</p>
                  <span className={styles.status}>{item.status || 'Unknown'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.pagination}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
