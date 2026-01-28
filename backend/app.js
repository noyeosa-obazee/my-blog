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
        return callback(new Error(msg), false);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server is running on " + PORT));
