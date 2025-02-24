require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");  

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();  

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    console.log(`http://localhost:${PORT}`)
} );

