import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import styles from "./PostDetail.module.css";

const PostDetail = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  const fetchPost = async () => {
    try {
      const res = await fetch(`${API_URL}/posts/${id}`);
      const data = await res.json();
      setPost(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);
  const handleEditClick = (comment) => {
    setEditingComment(comment);
    setNewComment(comment.text);

    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleCancelEdit = () => {
    setEditingComment(null);
    setNewComment("");
  };
  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      const res = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPost((prev) => ({
          ...prev,
          comments: prev.comments.filter((c) => c.id !== commentId),
        }));
      }
    } catch (err) {
      alert("Failed to delete comment");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    try {
      if (editingComment) {
        await fetch(`${API_URL}/comments/${editingComment.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newComment }),
        });
      } else {
        await fetch(`${API_URL}/posts/${id}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newComment }),
        });
      }

      setNewComment("");
      setEditingComment(null);
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
          <span style={{ fontWeight: "bold", color: " var(--primary)" }}>
            {post.user.username}
          </span>
          {" • "}
          {format(new Date(post.date), "MMMM d, yyyy")}
        </div>
      </header>

      <div className={styles.content}>{post.text}</div>

      <div className={styles.commentsSection}>
        <h3 className={styles.sectionTitle}>
          Comments ({post.comments.length})
        </h3>

        {user ? (
          <form onSubmit={handleSubmit} className={styles.form} ref={formRef}>
            {editingComment && (
              <div className={styles.editBadge}>
                Editing comment...
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={styles.btnCancel}
                >
                  Cancel
                </button>
              </div>
            )}
            <textarea
              className={styles.textarea}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Posting comment..."
                : editingComment
                  ? "Update Comment"
                  : "Post Comment"}
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
          {post.comments &&
            post.comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>
                    {comment.user.username || comment.user.email}
                  </span>
                  <span className={styles.commentDate}>
                    {format(new Date(comment.date), "MMM d, yyyy")}
                  </span>
                </div>

                <div className={styles.flexer}>
                  <p className={styles.commentBody}>{comment.text}</p>
                  {user && user.id === comment.userId && (
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleEditClick(comment)}
                        className={styles.btnActionEdit}
                        title="Edit Comment"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className={styles.btnActionDelete}
                        title="Delete Comment"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
