import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low'); // Added priority field
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('priority'); // priority, title, createdAt

  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchTasks();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/users/getProfile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data); // Assuming API returns { name, email }
  };
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/tasks/getTasks', {
      headers: { Authorization: `Bearer ${token}` },
    });

    let sortedTasks = res.data;

    // Apply filter
    if (filterStatus !== 'All') {
      sortedTasks = sortedTasks.filter(task =>
        filterStatus === 'Completed' ? task.status : !task.status
      );
    }

    // Apply sorting
    if (sortOrder === 'priority') {
      sortedTasks.sort(
        (a, b) =>
          ['High', 'Medium', 'Low'].indexOf(a.priority) -
          ['High', 'Medium', 'Low'].indexOf(b.priority)
      );
    } else if (sortOrder === 'title') {
      sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'createdAt') {
      sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setTasks(sortedTasks);
  };

  const handleAddTask = async () => {
    const token = localStorage.getItem('token');
    if (!title || !description) return alert('Title and Description required!');

    const res = await axios.post(
      'http://localhost:5000/api/tasks/create',
      { title, description, priority },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTasks(
      [...tasks, res.data].sort(
        (a, b) =>
          ['High', 'Medium', 'Low'].indexOf(a.priority) -
          ['High', 'Medium', 'Low'].indexOf(b.priority)
      )
    );
    setTitle('');
    setDescription('');
    setPriority('Low');
  };

  const handleDeleteTask = async taskId => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(tasks.filter(task => task._id !== taskId));
  };

  const handleEditTask = task => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
  };

  const handleUpdateTask = async () => {
    const token = localStorage.getItem('token');
    if (!editingTask) return;

    const res = await axios.put(
      `http://localhost:5000/api/tasks/${editingTask._id}`,
      { title, description, priority },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTasks(
      tasks
        .map(task => (task._id === res.data._id ? res.data : task))
        .sort(
          (a, b) =>
            ['High', 'Medium', 'Low'].indexOf(a.priority) -
            ['High', 'Medium', 'Low'].indexOf(b.priority)
        )
    );
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('Low');
  };

  const handleToggleStatus = async (taskId, currentStatus) => {
    const token = localStorage.getItem('token');
    const res = await axios.patch(
      `http://localhost:5000/api/tasks/${taskId}/status`,
      { status: !currentStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTasks(tasks.map(task => (task._id === res.data._id ? res.data : task)));
  };
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token
    window.location.href = '/login'; // Redirect to login
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
      <h2 className="text-3xl font-bold text-center text-gray-700">
        Dashboard
      </h2>

      {user && (
        <div className="max-w-3xl mx-auto bg-black p-4 rounded-lg shadow-md mb-6 flex justify-between items-center text-white">
          <div>
            <h3 className="text-xl font-bold">Welcome, {user.name} </h3>
            <p className="text-white">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}

      {/* Add/Edit Task Form */}
      <div className="max-w-3xl mx-auto bg-white p-4 rounded-lg shadow-md mt-6  mb-6">
        <h3 className="text-lg font-semibold mb-2">
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </h3>
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded mb-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="w-full p-2 border rounded mb-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>
        <button
          onClick={editingTask ? handleUpdateTask : handleAddTask}
          className="w-full bg-black text-white p-2 rounded hover:bg-blue-700"
        >
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
      </div>

      <div className="max-w-3xl mx-auto flex justify-between mb-4">
        {/* Filter by Status */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All Tasks</option>
          <option value="Completed">Completed</option>
          <option value="Incomplete">Incomplete</option>
        </select>

        {/* Sorting Options */}
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="priority">Sort by Priority</option>
          <option value="title">Sort by Title</option>
          <option value="createdAt">Sort by Date</option>
        </select>

        {/* Apply Button */}
        <button
          onClick={fetchTasks}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Apply
        </button>
      </div>

      {/* Task List */}
      <div className="max-w-3xl mx-auto mt-6">
        {tasks.map(task => (
          <div
            key={task._id}
            className="bg-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center"
          >
            <div>
              <h4 className="text-xl font-semibold">{task.title}</h4>
              <p className="text-gray-600">{task.description}</p>
              <p
                className={`font-bold ${
                  task.status ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {task.status ? 'Completed' : 'Incomplete'}
              </p>
              <p
                className={`font-bold ${
                  task.priority === 'High'
                    ? 'text-red-500'
                    : task.priority === 'Medium'
                    ? 'text-yellow-500'
                    : 'text-green-500'
                }`}
              >
                Priority: {task.priority}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleToggleStatus(task._id, task.status)}
                className={`px-3 py-1 rounded text-white ${
                  task.status
                    ? 'bg-red-500 hover:bg-red-700'
                    : 'bg-green-500 hover:bg-green-700'
                }`}
              >
                {task.status ? 'Mark Incomplete' : 'Mark Completed'}
              </button>
              <button
                onClick={() => handleEditTask(task)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
