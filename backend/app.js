const express = require("express");
const passport = require("passport");
const postRoutes = require("./routes/postsRouter");
const authRoutes = require("./routes/authRouter");
const commentRoutes = require("./routes/commentsRouter");
const cors = require("cors");
const jwtStrategy = require("./config/passport");
require("dotenv").config();

const app = express();

passport.use(jwtStrategy);

app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://devbrief-admins.netlify.app",
  "https://devbrief.netlify.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        const error = new Error(msg);
        error.status = 403;
        return callback(error, false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: false }));

app.use("/posts", postRoutes);
app.use("/auth", authRoutes);
app.use("/comments", commentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;
  const message =
    err.type === "entity.parse.failed"
      ? "Invalid JSON request body."
      : status >= 500
        ? "Internal server error."
        : err.message;

  if (status >= 500) console.error(err);

  res.status(status).json({ message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server is running on " + PORT));
