const express = require('express');
const router = express.Router();
const {
  createProject,
  deleteProject,
  getAllProjects,
  removeMembersFromProject,
  addMembersToProject,
  getUserProjects,
  getProjectMembers,
  getProjectProgress
} = require('../controller/projectController');

// Route to create a project
router.post('/api/projects', createProject);

// Route to delete a project by ID
router.delete('/api/projects/:projectId', deleteProject);

// Route to get all projects
router.get('/api/projects', getAllProjects);

// Route to get project members
router.get('/api/projects/:projectId/members', getProjectMembers);

// Route to remove members from a project
router.put('/api/projects/:projectId/remove-members', removeMembersFromProject);

// Route to add members to a project
router.put('/api/projects/:projectId/add-members', addMembersToProject);

router.get('/user/:userId/projects', getUserProjects);

// Route to get project progress
router.get('/api/projects/:projectId/progress', getProjectProgress);

module.exports = router;