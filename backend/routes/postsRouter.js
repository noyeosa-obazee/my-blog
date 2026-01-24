const { Router } = require("express");
const ctrl = require("../controllers/appControllers");
const passport = require("passport");
const postRoutes = Router();

postRoutes.get("/", ctrl.getPosts);
postRoutes.get("/:postId", ctrl.readPost);

postRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  ctrl.requireAdmin,
  ctrl.createPost,
);

postRoutes.put(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  ctrl.requireAdmin,
  ctrl.updatePost,
);

postRoutes.delete(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  ctrl.requireAdmin,
  ctrl.deletePost,
);

postRoutes.post(
  "/:postId/comments",
  passport.authenticate("jwt", { session: false }),
  ctrl.createComment,
);

module.exports = postRoutes;
