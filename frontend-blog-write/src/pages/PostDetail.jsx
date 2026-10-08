import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import { useAuth } from "../context/useAuth";
import StatePanel from "../components/StatePanel";
import { getErrorMessage, readApiResponse } from "../utils/api";
import styles from "./PostDetail.module.css";

const PostDetail = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [postError, setPostError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const formRef = useRef(null);

  useEffect(() => {
    let isCurrent = true;
    setIsLoadingPost(true);
    setPost(null);
    setPostError("");

    const loadPost = async () => {
      try {
        const response = await fetch(`${API_URL}/posts/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await readApiResponse(
          response,
          "Could not load this post.",
        );

        if (isCurrent) setPost(data);
      } catch (err) {
        if (isCurrent) {
          setPostError(getErrorMessage(err, "Could not load this post."));
        }
      } finally {
        if (isCurrent) setIsLoadingPost(false);
      }
    };

    loadPost();

    return () => {
      isCurrent = false;
    };
  }, [API_URL, id, retryCount, token]);

  const retryLoadingPost = () => {
    setPost(null);
    setPostError("");
    setIsLoadingPost(true);
    setRetryCount((count) => count + 1);
  };
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

    setCommentError("");
    setDeletingCommentId(commentId);
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      await readApiResponse(response, "Could not delete this comment.");
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((comment) => comment.id !== commentId),
      }));
    } catch (err) {
      setCommentError(getErrorMessage(err, "Could not delete this comment."));
    } finally {
      setDeletingCommentId(null);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentError("");
    setIsSubmitting(true);

    try {
      let response;
      if (editingComment) {
        response = await fetch(`${API_URL}/comments/${editingComment.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newComment }),
        });
      } else {
        response = await fetch(`${API_URL}/posts/${id}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newComment }),
        });
      }

      const data = await readApiResponse(
        response,
        "Could not save this comment.",
      );
      setPost((prev) => ({
        ...prev,
        comments: editingComment
          ? prev.comments.map((comment) =>
              comment.id === editingComment.id
                ? { ...comment, text: data.comment.text }
                : comment,
            )
          : [data, ...prev.comments],
      }));
      setNewComment("");
      setEditingComment(null);
    } catch (err) {
      setCommentError(getErrorMessage(err, "Could not save this comment."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPost) {
    return <StatePanel variant="loading" title="Loading post" />;
  }

  if (postError || !post) {
    return (
      <StatePanel
        variant="error"
        title="Post unavailable"
        message={postError || "This post could not be found."}
        action={
          <>
            <button onClick={retryLoadingPost}>Try again</button>
            <Link to="/">Back to posts</Link>
          </>
        }
      />
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          By <span className={styles.authorName}>{post.user.username}</span>
          {" • "}
          {format(new Date(post.date), "MMMM d, yyyy")}
        </div>
        <br />
        <Link to={`/edit/${post.id}`} className={styles.btnEdit}>
          Edit Post
        </Link>
      </header>

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(post.text || ""),
        }}
      />

      <div className={styles.commentsSection}>
        <h3 className={styles.sectionTitle}>
          Comments ({post.comments.length})
        </h3>

        {commentError && (
          <StatePanel
            variant="error"
            title="Comment action failed"
            message={commentError}
          />
        )}

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
          {post.comments.length === 0 ? (
            <StatePanel
              title="No comments yet"
              message="The conversation is ready to begin."
            />
          ) : (
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
                  <div className={styles.actions}>
                    {user && user.id === comment.userId && (
                      <button
                        onClick={() => handleEditClick(comment)}
                        className={styles.btnActionEdit}
                        title="Edit Comment"
                      >
                        Edit
                      </button>
                    )}
                    {user &&
                      (user.id === comment.userId || user.role === "ADMIN") && (
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          className={styles.btnActionDelete}
                          title="Delete Comment"
                          disabled={deletingCommentId === comment.id}
                        >
                          {deletingCommentId === comment.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
