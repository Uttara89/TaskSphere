const User = require('../models/userModel');

// Create or update a user
exports.storeUser = async (req, res) => {
  try {
    const { clerkUserId, email } = req.body;

    // Validate required fields
    if (!clerkUserId || !email) {
      return res.status(400).json({ message: 'clerkUserId and email are required' });
    }

    // Check if the user already exists
    let user = await User.findOne({ clerkUserId });
    if (user) {
      // Update the user's email if it has changed
      user.email = email.toLowerCase();
      await user.save();
      return res.status(200).json({ message: 'User updated successfully', user });
    }

    // Create a new user
    user = new User({
      clerkUserId,
      email: email.toLowerCase()
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error storing user:', error);
    res.status(500).json({ message: 'Error storing user', error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('clerkUserId email');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get a single user by Clerk ID
exports.getUserByClerkId = async (req, res) => {
  try {
    const { clerkUserId } = req.params;

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ message: `User with Clerk ID ${clerkUserId} not found` });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Delete a user by Clerk ID
exports.deleteUser = async (req, res) => {
  try {
    const { clerkUserId } = req.params;

    const user = await User.findOneAndDelete({ clerkUserId });
    if (!user) {
      return res.status(404).json({ message: `User with Clerk ID ${clerkUserId} not found` });
    }

    res.status(200).json({ message: 'User deleted successfully', user });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

