const express = require('express');
const router = express.Router();
const {
  storeUser,
  getAllUsers,
  getUserByClerkId,
  deleteUser
} = require('../controller/userController');

// Route to create or update a user
router.post('/api/users', storeUser);

// Route to get all users
router.get('/api/users', getAllUsers);

// Route to get a single user by Clerk ID
router.get('/api/users/:clerkUserId', getUserByClerkId);

// Route to delete a user by Clerk ID
router.delete('/api/users/:clerkUserId', deleteUser);




module.exports = router;