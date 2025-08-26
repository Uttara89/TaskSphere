const express = require('express');
const router = express.Router();
const { createTask, getTasks, markTaskComplete, deleteTask, getUserDeadlines, updateTask, getUserTasks } = require('../controller/taskController');

// Route to create a task
router.post('/api/tasks', createTask);

// Route to get all tasks
router.get('/api/tasks', getTasks);

router.put('/api/tasks/:taskId/:projectId/complete', markTaskComplete);

router.delete('/api/tasks/:taskId', deleteTask);

router.get('/user/:userId/deadlines', getUserDeadlines);

router.put('/api/tasks/:taskId', updateTask);

router.get('/user/:userId/tasks', getUserTasks);
module.exports = router;