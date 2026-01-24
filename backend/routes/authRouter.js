const { Router } = require("express");
const ctrl = require("../controllers/appControllers");
const authRoutes = Router();

authRoutes.post("/signup", ctrl.signUp);
authRoutes.post("/login", ctrl.logIn);

module.exports = authRoutes;
