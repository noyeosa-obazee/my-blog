const { Router } = require("express");
const ctrl = require("../controllers/appControllers");
const authRoutes = Router();

authRoutes.post("/signup", ctrl.signUp);

module.exports = authRoutes;
