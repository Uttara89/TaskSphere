const Task = require('../models/taskModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const mongoose = require('mongoose');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { title, assigneeEmail, projectId, deadline, importance } = req.body;

    // Find the user by email
    const user = await User.findOne({ email: assigneeEmail.toLowerCase() });
    console.log("User found:", user);
    if (!user) {
      return res.status(404).json({ message: `User with email ${assigneeEmail} not found` });
    }

    // Find the project by ID
    const project = await Project.findById(projectId);
    console.log("Project found:", project);
    if (!project) {
      return res.status(404).json({ message: `Project with ID ${projectId} not found` });
    }

    // Create the task with the user's ObjectId and projectId
    const task = new Task({
      title,
      assignee: user._id,
      project: project._id,
      deadline,
      importance
    });

    await task.save();

    // Add the task to the project's tasks array
    project.tasks.push(task._id);
    await project.save();

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.taskId.trim();

    // Validate taskId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting the task:", error);
    res.status(500).json({ message: "Error deleting the task", error: error.message });
  }
};

// Get all tasks with user and project details
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignee', 'email')
      .populate('project', 'name'); // Populate project details
    res.status(200).json(tasks);
  } catch (error) {
    console.log("Error fetching tasks:", error); // Log the error
    res.status(500).json({ message: error.message });
  }
};

exports.markTaskComplete = async (req, res) => {
  try {
    const taskId = req.params.taskId.trim(); // Correctly extract and trim taskId
    const projectId = req.params.projectId.trim(); // Correctly extract and trim projectId
   
    // Find and update the task
    const task = await Task.findByIdAndUpdate(taskId, { completed: true }, { new: true });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Find the associated project and populate its tasks
    const project = await Project.findById(projectId).populate('tasks');
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Calculate progress
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.completed).length;
    const progress = (completedTasks / totalTasks) * 100;

    // Update the project's progress
    project.progress = progress;
    await project.save();

    res.status(200).json({ message: "Task marked as complete and project progress updated" });
  } catch (error) {
    console.error("Error marking the task complete:", error);
    res.status(500).json({ message: "Error marking the task complete", error: error.message });
  }
};


//todo: a controller to update the task
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, assigneeEmail, projectId, deadline, importance } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    let assignee;
    if (assigneeEmail) {
      const user = await User.findOne({ email: assigneeEmail.toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: `User with email ${assigneeEmail} not found` });
      }
      assignee = user._id;
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (deadline) updateData.deadline = deadline;
    if (importance) updateData.importance = importance;
    if (assignee) updateData.assignee = assignee;

    updateData.project = projectId;

    // Update the task and populate fields
    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true })
      .populate('project', 'name') // Populate project name
      .populate('assignee', 'email'); // Populate assignee email

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

exports.getUserDeadlines = async(req, res) =>{
  try{
    const {userId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(userId)){
      return res.status(400).json({message:"Invalid user ID"});
    }

    // Return only upcoming deadlines for tasks that are not completed
    const tasks = await Task.find({
      assignee: userId,
      completed: false,
      deadline: { $exists: true, $ne: null }
    })
    .select('title deadline completed -_id')
    .sort({ deadline: 1 });

    res.status(200).json({ deadlines: tasks });


  }catch(error){
    console.error("Error fetching deadlines:", error);
    res.status(500).json({ message: "Error fetching deadlines", error: error.message });
  }
}

exports.getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('getUserTasks called with userId:', userId); // Debug log

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Fetch only tasks assigned to the specific user
    const tasks = await Task.find({ assignee: userId })
      .populate('project', 'name') // Populate project details
      .populate('assignee', 'email name') // Populate assignee details
      .select('title deadline completed importance project assignee') // Include assignee field
      .sort({ deadline: 1 }); // Sort by deadline (earliest first)

    console.log('Found tasks assigned to user:', tasks.length); // Debug log
    console.log('Tasks details:', JSON.stringify(tasks, null, 2)); // Debug log

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    res.status(500).json({ message: "Error fetching user tasks", error: error.message });
  }
};
