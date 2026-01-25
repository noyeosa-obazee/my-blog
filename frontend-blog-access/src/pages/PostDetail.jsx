import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import styles from "./PostDetail.module.css";

const PostDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPost = async () => {
    try {
      const res = await fetch(`http://localhost:3000/posts/${id}`);
      const data = await res.json();
      setPost(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    try {
      await fetch(`http://localhost:3000/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      setNewComment("");
      fetchPost();
    } catch (err) {
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>
    );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          By{" "}
          <span style={{ fontWeight: "bold", color: "#4f46e5" }}>
            {post.user.username}
          </span>
          {" • "}
          {format(new Date(post.date), "MMMM d, yyyy")}
        </div>
      </header>

      <div className={styles.content}>{post.content}</div>

      <div className={styles.commentsSection}>
        <h3 className={styles.sectionTitle}>
          Discussion ({post.comments.length})
        </h3>

        {user ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <textarea
              className={styles.textarea}
              placeholder="Add to the discussion..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
            <div style={{ clear: "both" }}></div>
          </form>
        ) : (
          <div className={styles.loginPrompt}>
            <p className={styles.promptText}>Want to join the conversation?</p>
            <Link to="/login" className={styles.linkLogin}>
              Log in to leave a comment
            </Link>
          </div>
        )}
        <div className={styles.commentList}>
          {post.comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>
                  {comment.user.username || comment.user.email}
                </span>
                <span className={styles.commentDate}>
                  {format(new Date(comment.date), "MMM d, yyyy")}
                </span>
              </div>
              <p className={styles.commentBody}>{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
