const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Group = require('../models/groupModel');

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*', // Adjust this for production
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Join a group room
        socket.on('joinGroup', async (groupId) => {
            
            if (!mongoose.Types.ObjectId.isValid(groupId)) {
                return socket.emit('error', 'Invalid group ID');
            }
        
            socket.join(groupId);
            console.log(`User joined group: ${groupId}`);
        
            try {
                // Fetch existing messages for the group
                const group = await Group.findById(groupId).select('messages').populate('messages.sender', 'name email');
                if (group) {
                    console.log('Existing messages:', group.messages); // Debugging log
                    socket.emit('existingMessages', group.messages); // Send existing messages to the user
                    console.log('messages sent to the user')
                }
            } catch (error) {
                console.error('Error fetching group messages:', error);
                socket.emit('error', 'Error fetching group messages');
            }
        });

        // Handle sending messages
        socket.on('sendMessage', async ({ groupId, senderId, content, attachment }) => {
            try {
                if (!mongoose.Types.ObjectId.isValid(groupId)) {
                    return socket.emit('error', 'Invalid group ID');
                }
                if (!mongoose.Types.ObjectId.isValid(senderId)) {
                    return socket.emit('error', 'Invalid sender ID');
                }
                if (!content || content.trim() === '') {
                    return socket.emit('error', 'Message content cannot be empty');
                }

                const group = await Group.findById(groupId);
                if (!group) {
                    return socket.emit('error', 'Group not found');
                }

                const message = {
                    sender: senderId,
                    content: content,
                    timestamp: new Date(),
                };

                // Add attachment if provided
                if (attachment) {
                    message.attachment = attachment;
                }

                group.messages.push(message);
                await group.save();

                // Populate the sender information before emitting
                await group.populate('messages.sender', 'name email');
                const savedMessage = group.messages[group.messages.length - 1]; // Get the last added message

                console.log('Sending new message to group:', savedMessage); // Debug log

                const messageToEmit = {
                    groupId,
                    sender: savedMessage.sender, // Send populated sender object
                    content: savedMessage.content,
                    timestamp: savedMessage.timestamp,
                };

                // Include attachment if present
                if (savedMessage.attachment) {
                    messageToEmit.attachment = savedMessage.attachment;
                }

                io.to(groupId).emit('newMessage', messageToEmit);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', 'Error sending message');
            }
        });

        // Handle typing indicators
        socket.on('typing', (groupId) => {
            socket.to(groupId).emit('userTyping', { groupId, userId: socket.id });
        });

        socket.on('stopTyping', (groupId) => {
            socket.to(groupId).emit('userStoppedTyping', { groupId, userId: socket.id });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
        });
    });

    return io;
};

module.exports = setupSocket;