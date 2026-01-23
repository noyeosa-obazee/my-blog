const express = require("express");
const passport = require("passport");
const postRoutes = require("./routes/postsRouter");
const authRoutes = require("./routes/authRouter");
const cors = require("cors");
const { jwtStrategy } = require("./config/passport");
require("dotenv").config();

const app = express();

passport.use(jwtStrategy);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use("/posts", postRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server is running on " + PORT));
