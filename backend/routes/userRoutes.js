const express = require("express");
const controllers = require("../controllers/userControllers");  
const router = express.Router();
const checkToken = require("../middlewares/checkToken");


router.post("/register", controllers.signUpUsers);
router.post("/login", controllers.loginUsers);
router.get("/getProfile", checkToken,controllers.getProfile);


module.exports = router; 
