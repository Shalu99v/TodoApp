const Task = require("../models/taskSchema");

module.exports.createTask = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const userId = req.user.id; 

    if (!title || !priority) {
      return res.status(400).json({ message: "Title and Priority are required" });
    }

    const task = new Task({ title, description, priority, user: userId });
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Ensure the task belongs to the logged-in user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Ensure the task belongs to the logged-in user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Ensure the task belongs to the logged-in user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    task.status = !task.status; // Toggle status
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
