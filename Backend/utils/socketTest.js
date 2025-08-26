const { io } = require('socket.io-client');

const socket = io('http://localhost:3000'); // Replace with your backend URL

// Connect to the server
socket.on('connect', () => {
    console.log('Connected to server:', socket.id);

    // Join a group
    const groupId = '680a0b0cec0e897b49399581'; // Replace with a valid group ID
    socket.emit('joinGroup', groupId);
    console.log(`Joined group: ${groupId}`);

    // Send a message
    const message = {
        groupId: groupId,
        senderId: '67f26183e4ef1adf6b561857', // Replace with a valid user ID
        content: 'Hello, this is a test message!',
    };
    socket.emit('sendMessage', message);
    console.log('Message sent:', message);
});

// Listen for new messages
socket.on('newMessage', (message) => {
    console.log('New message received:', message);
});

// Handle errors
socket.on('error', (error) => {
    console.error('Error:', error);
});

// Handle disconnection
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});