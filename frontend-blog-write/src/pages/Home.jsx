import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import styles from "./Home.module.css";

const Home = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:3000/posts/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id) => {
    const postToUpdate = posts.find((p) => p.id === id);
    try {
      const response = await fetch(`http://localhost:3000/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: postToUpdate.title,
          text: postToUpdate.text,
          published: !postToUpdate.published,
        }),
      });

      if (response.ok) {
        fetchPosts();
      } else {
        alert("Failed to update post status. Please try again.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Check your connection.");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          Loading posts...
        </div>
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

              <div className={styles.cardActions}>
                <span
                  className={`${styles.statusFlag} ${post.published ? styles.published : styles.draft}`}
                >
                  {post.published ? "Published" : "Draft"}
                </span>

                <div className={styles.actionButtons}>
                  <button
                    className={styles.btnToggle}
                    onClick={() => handleTogglePublish(post.id)}
                  >
                    {post.published ? "Unpublish" : "Publish"}
                  </button>

                  <Link to={`/edit/${post.id}`} className={styles.btnEdit}>
                    Edit
                  </Link>
                </div>
              </div>

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
