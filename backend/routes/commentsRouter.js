const { Router } = require("express");
const ctrl = require("../controllers/appControllers");
const passport = require("passport");
const commentRoutes = Router();

commentRoutes.post(
  "/:commentId",
  passport.authenticate("jwt", { session: false }),
  ctrl.createComment,
);

commentRoutes.delete(
  "/:commentId",
  passport.authenticate("jwt", { session: false }),
  ctrl.deleteComment,
);

commentRoutes.put(
  "/:commentId",
  passport.authenticate("jwt", { session: false }),
  ctrl.updateComment,
);

module.exports = commentRoutes;
