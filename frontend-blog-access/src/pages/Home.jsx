import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import styles from "./Home.module.css";

const Home = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.title}>
          Read. Learn. <span className={styles.highlight}>Evolve.</span>
        </h1>
        <p className={styles.subtitle}>
          Deep dives into code, law, and everything in between.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>
      ) : (
        <div className={styles.grid}>
          {posts.map((post) => (
            <article key={post.id} className={styles.card}>
              <div className={styles.meta}>
                <span className={styles.tag}>Article</span>
                <span className={styles.date}>
                  {format(new Date(post.date), "MMM d, yyyy")}
                </span>
              </div>

              <Link to={`/posts/${post.id}`}>
                <h2 className={styles.cardTitle}>{post.title}</h2>
              </Link>

              <p className={styles.cardExcerpt}>
                {post.text.substring(0, 100)}...
              </p>

              <div className={styles.cardFooter}>
                <span className={styles.author}>By {post.user.username}</span>
                <Link to={`/posts/${post.id}`} className={styles.readMore}>
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
