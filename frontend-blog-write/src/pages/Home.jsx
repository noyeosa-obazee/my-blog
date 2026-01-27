import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import styles from "./Home.module.css";

const Home = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:3000/posts/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        navigate("/login");
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:3000/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
      } else {
        alert("Failed to delete post.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("An error occurred while deleting.");
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
        setPosts(
          posts.map((post) => {
            if (post.id === id) {
              return { ...post, published: !post.published };
            } else {
              return post;
            }
          }),
        );
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
      <div className={styles.columnFlexer}>
        <Link to="/create" className={styles.btnCreate}>
          Create Post
        </Link>
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
                    <button
                      className={styles.btnDelete}
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </button>
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
    </div>
  );
};

export default Home;
