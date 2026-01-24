const { Router } = require("express");
const prisma = require("../config/prisma");
const ctrl = require("../controllers/appControllers");
const postRoutes = Router();

postRoutes.get("/", ctrl.getPosts);

module.exports = postRoutes;
