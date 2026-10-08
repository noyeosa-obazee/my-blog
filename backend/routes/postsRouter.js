const { Router } = require("express");
const ctrl = require("../controllers/appControllers");
const authenticateJwt = require("../middlewares/authenticateJwt");
const postRoutes = Router();

postRoutes.get("/", ctrl.getPublishedPosts);
postRoutes.get("/all", authenticateJwt, ctrl.requireAdmin, ctrl.getAllPosts);
postRoutes.get(
  "/admin/:postId",
  authenticateJwt,
  ctrl.requireAdmin,
  ctrl.readAdminPost,
);
postRoutes.get("/:postId", ctrl.readPost);

postRoutes.post("/", authenticateJwt, ctrl.requireAdmin, ctrl.createPost);

postRoutes.put("/:postId", authenticateJwt, ctrl.requireAdmin, ctrl.updatePost);

postRoutes.delete(
  "/:postId",
  authenticateJwt,
  ctrl.requireAdmin,
  ctrl.deletePost,
);

postRoutes.post("/:postId/comments", authenticateJwt, ctrl.createComment);

postRoutes.get("/:postId/comments", ctrl.getPostComments);

module.exports = postRoutes;
