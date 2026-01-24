const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma.js");

const signUp = async (req, res) => {
  try {
    const { email, password, username, confirmPassword } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await prisma.blog_User.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.blog_User.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      message: "User created successfully",
      token: token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong during signup" });
  }
};

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.blog_User.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email address" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await prisma.blog_Post.findMany({
      orderBy: {
        date: "desc",
      },

      where: {
        published: true,
      },

      include: {
        user: {
          select: { username: true },
        },
        comments: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching posts" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  next();
};

const createPost = async (req, res) => {
  try {
    const { title, text, published } = req.body;

    if (!title || !text) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const newPost = await prisma.blog_Post.create({
      data: {
        title: title,
        text: text,
        published: published ? published : false,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ message: "Server error while creating post" });
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { title, text, published } = req.body;

    const updatedPost = await prisma.blog_Post.update({
      where: { id: postId },
      data: {
        title: title,
        text: text,
        published: published,
      },
    });

    res.json({ message: "Post updated!", post: updatedPost });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Post not found" });
    }
    console.error(err);
    res.status(500).json({ message: "Error updating post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    await prisma.blog_Post.delete({
      where: { id: postId },
    });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Post not found" });
    }
    console.error(err);
    res.status(500).json({ message: "Error deleting post" });
  }
};

const readPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await prisma.blog_Post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: { username: true, email: true },
        },

        comments: {
          orderBy: { date: "desc" },
          include: {
            user: {
              select: { username: true, email: true },
            },
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.published) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching post" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const comment = await prisma.blog_Comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isAuthor = comment.userId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment" });
    }

    await prisma.blog_Comment.delete({
      where: { id: commentId },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting comment" });
  }
};

const updateComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const { text } = req.body;

    const comment = await prisma.blog_Comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only edit your own comments" });
    }

    const updatedComment = await prisma.blog_Comment.update({
      where: { id: commentId },
      data: { text: text },
    });

    res.json({ message: "Comment updated", comment: updatedComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating comment" });
  }
};

const createComment = async (req, res) => {
  try {
    const postId = req.params.postId;

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const postExists = await prisma.blog_Post.findUnique({
      where: { id: postId },
    });
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = await prisma.blog_Comment.create({
      data: {
        text: text,
        postId: postId,
        userId: req.user.id,
      },

      include: {
        user: {
          select: { username: true, email: true },
        },
      },
    });

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error posting comment" });
  }
};

const getPostComments = async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await prisma.blog_Comment.findMany({
      where: {
        postId: postId,
      },

      orderBy: {
        date: "desc",
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            // id: true // (Optional)  in case I need clickable profile links
          },
        },
      },
    });

    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Error fetching comments" });
  }
};

module.exports = {
  signUp,
  logIn,
  getPosts,
  requireAdmin,
  createPost,
  readPost,
  updatePost,
  deletePost,
  deleteComment,
  updateComment,
  createComment,
  getPostComments,
};
