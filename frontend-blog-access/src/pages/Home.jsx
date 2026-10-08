import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import StatePanel from "../components/StatePanel";
import { getErrorMessage, readApiResponse } from "../utils/api";
import styles from "./Home.module.css";

const getPostExcerpt = (content) => {
  const sanitizedContent = DOMPurify.sanitize(content || "", {
    RETURN_DOM: true,
  });
  const plainText = (
    sanitizedContent.innerText ||
    sanitizedContent.textContent ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length > 100
    ? `${plainText.substring(0, 100)}...`
    : plainText;
};

const Home = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const loadPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts`);
        const data = await readApiResponse(response, "Could not load posts.");

        if (!Array.isArray(data)) {
          throw new Error("The server returned an invalid posts list.");
        }

        if (isCurrent) setPosts(data);
      } catch (err) {
        if (isCurrent) {
          setError(getErrorMessage(err, "Could not load posts."));
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadPosts();

    return () => {
      isCurrent = false;
    };
  }, [API_URL, retryCount]);

  const retryLoadingPosts = () => {
    setError("");
    setLoading(true);
    setRetryCount((count) => count + 1);
  };

  return (
    <div>
      <header className={styles.hero}>
        <h1 className={styles.title}>
          Read. Learn. <span className={styles.highlight}>Evolve.</span>
        </h1>
        <p className={styles.subtitle}>
          Deep dives into all things programming.
        </p>
      </header>

      {loading ? (
        <StatePanel variant="loading" title="Loading articles" />
      ) : error ? (
        <StatePanel
          variant="error"
          title="Articles are unavailable"
          message={error}
          action={<button onClick={retryLoadingPosts}>Try again</button>}
        />
      ) : posts.length === 0 ? (
        <StatePanel
          title="No articles yet"
          message="There are no published articles to read right now. Check back soon."
        />
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

              <p className={styles.cardExcerpt}>{getPostExcerpt(post.text)}</p>

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
