const { Router } = require("express");
const ctrl = require("../controllers/appControllers");
const authenticateJwt = require("../middlewares/authenticateJwt");
const commentRoutes = Router();

commentRoutes.post("/:commentId", authenticateJwt, ctrl.createComment);

commentRoutes.delete("/:commentId", authenticateJwt, ctrl.deleteComment);

commentRoutes.put("/:commentId", authenticateJwt, ctrl.updateComment);

module.exports = commentRoutes;
