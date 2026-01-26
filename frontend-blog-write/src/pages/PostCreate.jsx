import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import styles from "./PostCreate.module.css";

const CreatePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchPostData(id);
    }
  }, [id]);

  const fetchPostData = async (postId) => {
    try {
      const res = await fetch(`http://localhost:3000/posts/${postId}`);
      if (!res.ok) throw new Error("Failed to load post");
      const data = await res.json();

      setTitle(data.title);
      setContent(data.text);
    } catch (err) {
      console.error(err);
      alert("Could not load post data");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    const url = isEditMode
      ? `http://localhost:3000/posts/${id}`
      : "http://localhost:3000/posts";

    const method = isEditMode ? "PUT" : "POST";

    const postData = { title, content };

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!res.ok) throw new Error("Failed to save post");

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createPostContainer}>
      <h1>{isEditMode ? "Edit Post" : "Create New Post"}</h1>

      <form onSubmit={handleSubmit}>
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
            onEditorChange={(newValue, editor) => setContent(newValue)}
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
