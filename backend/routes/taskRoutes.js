const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskControllers");
const checkToken = require("../middlewares/checkToken");

router.post("/create", checkToken,taskController.createTask);       
router.get("/getTasks", checkToken,taskController.getTasks);          
router.put("/:id", checkToken,taskController.updateTask);      
router.delete("/:id",checkToken, taskController.deleteTask); 
router.patch("/:id/status",checkToken, taskController.toggleTaskStatus); 

module.exports = router;
