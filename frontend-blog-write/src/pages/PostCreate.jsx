import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { useAuth } from "../context/useAuth";
import StatePanel from "../components/StatePanel";
import { getErrorMessage, readApiResponse } from "../utils/api";
import styles from "./PostCreate.module.css";

const CreatePost = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(Boolean(id));
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const isEditMode = Boolean(id);

  useEffect(() => {
    setLoadError("");
    setIsLoadingPost(Boolean(id));
    if (!id) {
      setTitle("");
      setContent("");
      return undefined;
    }

    let isCurrent = true;

    const loadPostData = async () => {
      try {
        const response = await fetch(`${API_URL}/posts/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await readApiResponse(
          response,
          "Could not load post data.",
        );

        if (isCurrent) {
          setTitle(data.title);
          setContent(data.text);
        }
      } catch (err) {
        if (isCurrent) {
          setLoadError(getErrorMessage(err, "Could not load post data."));
        }
      } finally {
        if (isCurrent) setIsLoadingPost(false);
      }
    };

    loadPostData();

    return () => {
      isCurrent = false;
    };
  }, [API_URL, id, retryCount, token]);

  const retryLoadingPost = () => {
    setLoadError("");
    setIsLoadingPost(true);
    setRetryCount((count) => count + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError("");

    const url = isEditMode ? `${API_URL}/posts/${id}` : `${API_URL}/posts`;

    const method = isEditMode ? "PUT" : "POST";

    const postData = { title, text: content };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      await readApiResponse(response, "Failed to save post.");

      navigate("/");
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Failed to save post."));
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingPost) {
    return <StatePanel variant="loading" title="Loading post" />;
  }

  if (loadError) {
    return (
      <StatePanel
        variant="error"
        title="Could not load this post"
        message={loadError}
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
    <div className={styles.createPostContainer}>
      <h1>{isEditMode ? "Edit Post" : "Create New Post"}</h1>

      <form onSubmit={handleSubmit}>
        {submitError && (
          <StatePanel
            variant="error"
            title="Could not save post"
            message={submitError}
          />
        )}
        <div className={styles.formGroup}>
          <label>Post Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title..."
            className={styles.titleInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Content</label>
          <Editor
            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
            value={content}
            onEditorChange={(newValue) => setContent(newValue)}
            init={{
              height: 400,
              menubar: false,
              plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table paste code help wordcount",
              ],
              toolbar:
                "undo redo | formatselect | bold italic backcolor | \
                alignleft aligncenter alignright alignjustify | \
                bullist numlist outdent indent | removeformat | help",
              content_style: `
                @import url('https://fonts.googleapis.com/css2?family=Google+Sans+Code:wght@400;600;700&display=swap');
                body { font-family: Google Sans Code, monospace; font-weight: 500; }`,
            }}
          />
        </div>

        <button type="submit" className={styles.btnSave} disabled={loading}>
          {loading ? "Saving..." : isEditMode ? "Update Post" : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
