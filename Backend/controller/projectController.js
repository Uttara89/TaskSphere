const Project = require('../models/projectModel');
const User = require('../models/userModel');
const Task = require('../models/taskModel');
const Group = require('../models/groupModel');
const mongoose = require('mongoose') // Assuming you have a Group model
// Create a new project
//? 		a. Automatically create a group for the project
//?		  b. Create the project
//?     c.Add users through their emails
exports.createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
 
    // Validate required fields
    if (!name || !members || !Array.isArray(members)) {
      return res.status(400).json({ message: 'Project name and members are required' });
    }

    // Find users by their emails
    const users = await User.find({ email: { $in: members.map(email => email.toLowerCase()) } });
    console.log('Users found:', users);

  

    if (users.length !== members.length) {
      return res.status(404).json({ message: 'Some members not found in the database' });
    }

    // Create the project with the users' ObjectIds
    const project = new Project({
      name,
      description,
      members: users.map(user => user._id),
    });

    await project.save();

    // Automatically create a group for the project
    console.log('Creating group for project:', name); // Debug log
    const group = new Group({
      name: `${name} Group`, // Group name based on the project name
      description: `Group for project: ${name}`,
      members: users.map(user => user._id), // Same members as the project
    });

    await group.save();
    console.log('Group created successfully:', group); // Debug log

    res.status(201).json({
      message: 'Project and corresponding group created successfully',
      project,
      group,
    });
  } catch (error) {
    console.error('Error creating project and group:', error);
    res.status(500).json({ message: 'Error creating project and group', error: error.message });
  }
};

// Delete a project by ID
//? 		a. Once the project is deleted, all the tasks associated to it are also deleted
//?     b. Delete the group associated with the project
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    await Task.deleteMany({ project: project._id });
    const group = await Group.findOneAndDelete({ name: `${project.name} Group` });

    res.status(200).json(
    { message: 'Project deleted successfully',
      project,
      deletedGroup: group
     });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('members', 'email name') // Populate member details
      .populate('tasks', 'title deadline'); // Populate task details

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// Get project members
exports.getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    // Find the project and populate members
    const project = await Project.findById(projectId)
      .populate('members', 'email name _id');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ members: project.members });
  } catch (error) {
    console.error('Error fetching project members:', error);
    res.status(500).json({ message: 'Error fetching project members', error: error.message });
  }
};

// Remove members from a project
//?     a. Once the members are removed, all the tasks associated to them are also deleted
//?     b. once a member is removed from the project, his/her respective tasks are also removed from the project, as well as the task collection
//?    c. once a member is removed from the project, the membres array of the group is also updated
exports.removeMembersFromProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { memberEmails } = req.body;

    // Validate required fields
    if (!memberEmails || !Array.isArray(memberEmails) || memberEmails.length === 0) {
      return res.status(400).json({ message: 'memberEmails is required and must be a non-empty array' });
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find members to remove by their emails
    const membersToRemove = await User.find({
      email: { $in: memberEmails.map(email => email.toLowerCase()) }
    });
    console.log('Members to remove:', membersToRemove);

    if (membersToRemove.length === 0) {
      return res.status(404).json({ message: 'No matching members found in the database' });
    }

    // Remove members from the project
    project.members = project.members.filter(
      memberId => !membersToRemove.some(member => member._id.equals(memberId))
    );
    await project.save();

    // Get IDs of members being removed
    const memberIdsToRemove = membersToRemove.map(member => member._id);
    console.log('Member IDs to remove:', memberIdsToRemove);

    // Find tasks associated with the removed members in this project
    const tasksToDelete = await Task.find({
      project: projectId,
      assignee: { $in: memberIdsToRemove }
    });
    console.log('Tasks to delete:', tasksToDelete);

    const taskIdsToDelete = tasksToDelete.map(task => task._id.toString());

    // Remove task references from the project's tasks array
    project.tasks = project.tasks.filter(taskId =>
      !taskIdsToDelete.includes(taskId.toString())
    );
    // Mark tasks field as modified if needed
    project.markModified('tasks');
    await project.save();
    console.log("just before delteing the task from the task collection")
    // Now delete the tasks from the tasks collection
    const deleteResult = await Task.deleteMany({
      project: project._id,
      assignee: { $in: memberIdsToRemove }
    });
    console.log('Delete result:', deleteResult);
    const group = await Group.findOne({ name: `${project.name} Group` });
    if (group) {
      group.members = group.members.filter(memberId =>
        !memberIdsToRemove.some(id => id.equals(memberId))
      );
      await group.save();
      console.log('Group updated:', group);
    } else {
      console.warn('Group not found for project:', project.name);
    }

    res.status(200).json({ message: 'Members and their tasks removed successfully', project });
  } catch (error) {
    console.error('Error removing members from project:', error);
    res.status(500).json({ message: 'Error removing members from project', error: error.message });
  }
};
  // Add members to a project
//?    a. once a member is added to the project , the membres array of the group collection is also updated
exports.addMembersToProject = async (req, res) => {
    try {
      console.log('Request body:', req.body); // Log the request body
      const { projectId } = req.params;
      const { memberEmails } = req.body;
      console.log('Adding members to project:', { projectId, memberEmails });
      // Validate required fields
      if (!memberEmails || !Array.isArray(memberEmails)) {
        return res.status(400).json({ message: 'memberEmails is required and must be an array' });
      }
  
      // Find the project
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      // Find members to add by their emails
      const membersToAdd = await User.find({ email: { $in: memberEmails.map(email => email.toLowerCase()) } });
      
  
      if (membersToAdd.length === 0) {
        return res.status(404).json({ message: 'No matching members found in the database' });
      }
  
      // Add new members to the project (avoid duplicates)
      const newMemberIds = membersToAdd.map(member => member._id);
      project.members = [...new Set([...project.members, ...newMemberIds])];
  
      await project.save();

      const group = await Group.findOne({ name: `${project.name} Group` });
      if (group) {
        group.members = [...new Set([...group.members, ...newMemberIds])];
        await group.save();
        console.log('Group updated:', group);
      } else {
        console.warn('Group not found for project:', project.name);
      }
  
      res.status(200).json({ message: 'Members added successfully', project });
    } catch (error) {
      console.error('Error adding members to project:', error);
      res.status(500).json({ message: 'Error adding members to project', error: error.message });
    }
  };

exports.getUserProjects = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Validate the userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
  
      // Find all projects where the user is a member
      const projects = await Project.find({ members: userId })
        .populate('members', 'email name') // Populate member details
        .populate('tasks', 'title deadline'); // Populate task details
  
      res.status(200).json({ projects });
    } catch (error) {
      console.error('Error fetching user projects:', error);
      res.status(500).json({ message: 'Error fetching user projects', error: error.message });
    }
  };

// Get project progress details
exports.getProjectProgress = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate the projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Find the project and populate its tasks
    const project = await Project.findById(projectId)
      .populate('members', 'email name')
      .populate({
        path: 'tasks',
        populate: {
          path: 'assignee',
          select: 'email name'
        }
      });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Calculate progress statistics
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Categorize tasks by importance
    const tasksByImportance = {
      High: project.tasks.filter(task => task.importance === 'High'),
      Medium: project.tasks.filter(task => task.importance === 'Medium'),
      Low: project.tasks.filter(task => task.importance === 'Low')
    };

    // Get upcoming deadlines (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = project.tasks.filter(task => 
      task.deadline && 
      new Date(task.deadline) > now && 
      new Date(task.deadline) <= nextWeek &&
      !task.completed
    );

    // Response object
    const progressData = {
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        members: project.members
      },
      statistics: {
        totalTasks,
        completedTasks,
        pendingTasks,
        progressPercentage
      },
      tasksByImportance: {
        High: tasksByImportance.High.length,
        Medium: tasksByImportance.Medium.length,
        Low: tasksByImportance.Low.length
      },
      upcomingDeadlines: upcomingDeadlines.length,
      recentTasks: project.tasks.slice(-5), // Last 5 tasks
      tasks: project.tasks // All tasks for detailed view
    };

    res.status(200).json(progressData);
  } catch (error) {
    console.error('Error fetching project progress:', error);
    res.status(500).json({ message: 'Error fetching project progress', error: error.message });
  }
};