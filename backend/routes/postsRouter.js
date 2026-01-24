const { Router } = require("express");
const prisma = require("../config/prisma");
const ctrl = require("../controllers/appControllers");
const passport = require("passport");
const postRoutes = Router();

postRoutes.get("/", ctrl.getPosts);
postRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  ctrl.requireAdmin,
  ctrl.createPost,
);

module.exports = postRoutes;
