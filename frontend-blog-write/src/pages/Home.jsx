import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
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
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const loadPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
  }, [API_URL, token, retryCount]);

  const retryLoadingPosts = () => {
    setError("");
    setLoading(true);
    setRetryCount((count) => count + 1);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post? This cannot be undone.",
      )
    ) {
      return;
    }

    setActionError("");
    setPendingAction({ id, type: "delete" });
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await readApiResponse(response, "Could not delete this post.");
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id));
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not delete this post."));
    } finally {
      setPendingAction(null);
    }
  };

  const handleTogglePublish = async (id) => {
    const postToUpdate = posts.find((p) => p.id === id);
    if (!postToUpdate) return;

    setActionError("");
    setPendingAction({ id, type: "publish" });
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
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

      await readApiResponse(response, "Could not update this post.");
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === id ? { ...post, published: !post.published } : post,
        ),
      );
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update this post."));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div>
      <div className={styles.columnFlexer}>
        <Link to="/create" className={styles.btnCreate}>
          Create Post
        </Link>
        {actionError && (
          <StatePanel
            variant="error"
            title="Post action failed"
            message={actionError}
          />
        )}
        {loading ? (
          <StatePanel variant="loading" title="Loading posts" />
        ) : error ? (
          <StatePanel
            variant="error"
            title="Posts are unavailable"
            message={error}
            action={<button onClick={retryLoadingPosts}>Try again</button>}
          />
        ) : posts.length === 0 ? (
          <StatePanel
            title="No posts yet"
            message="Create your first post to start building the blog."
            action={<Link to="/create">Create your first post</Link>}
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

                <p className={styles.cardExcerpt}>
                  {getPostExcerpt(post.text)}
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
                      disabled={pendingAction !== null}
                    >
                      {pendingAction?.id === post.id &&
                      pendingAction.type === "publish"
                        ? "Saving..."
                        : post.published
                          ? "Unpublish"
                          : "Publish"}
                    </button>

                    <Link to={`/edit/${post.id}`} className={styles.btnEdit}>
                      Edit
                    </Link>
                    <button
                      className={styles.btnDelete}
                      onClick={() => handleDelete(post.id)}
                      disabled={pendingAction !== null}
                    >
                      {pendingAction?.id === post.id &&
                      pendingAction.type === "delete"
                        ? "Deleting..."
                        : "Delete"}
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
