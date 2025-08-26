import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { createSocket } from '../utils/socket';
import { useUserContext } from '../context/UserContext';

const Connect = () => {
  const [groups, setGroups] = useState([]); // State to store groups
  const [messages, setMessages] = useState([]); // State to store messages
  const [currentGroupId, setCurrentGroupId] = useState(null); // State to track the current group
  const [newMessage, setNewMessage] = useState(''); // State for the new message input
  const [selectedFile, setSelectedFile] = useState(null); // State for file upload
  const [uploadProgress, setUploadProgress] = useState(0); // State for upload progress
  const [isUploading, setIsUploading] = useState(false); // State for upload status
  
  // Get the actual user ID from context instead of hardcoded value
  const { userId, dbUser, isUserSynced } = useUserContext();
  
  // Use useRef to ensure we only have one socket connection
  const socketRef = useRef(null);
  
  // Debug: log the userId being used
  console.log('Connect: Current userId being used:', userId);
  console.log('Connect: DB User:', dbUser);
  console.log('Connect: Is user synced:', isUserSynced);

  // Initialize socket connection once
  useEffect(() => {
    if (!socketRef.current) {
      console.log('Initializing socket connection...');
  socketRef.current = createSocket();
      
      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Fetch user groups on component mount
  useEffect(() => {
    const fetchUserGroups = async () => {
      // Wait for user to be synced before fetching groups
      if (!userId || !isUserSynced) {
        console.log('Connect: Waiting for user sync before fetching groups...');
        return;
      }
      
      console.log('Connect: Fetching groups for userId:', userId);
      
      try {
  const response = await api.get(`/tasksphere/user/${userId}/groups`);
        console.log('Connect: Groups response:', response.data);
        setGroups(response.data.groups); // Set the fetched groups in state
      } catch (error) {
        console.error('Connect: Error fetching user groups:', error);
      }
    };

    fetchUserGroups();
  }, [userId, isUserSynced]); // Add isUserSynced to dependencies

  // Listen for existing messages when joining a group
  useEffect(() => {
    if (!socketRef.current) return;
    
    console.log("Setting up socket listeners")
    
    // Listen for existing messages
    socketRef.current.on('existingMessages', (messages) => {
      console.log("Received existingMessages:", messages);
      console.log("Messages count:", messages.length); // Debug log
      setMessages(messages); // Set the fetched messages in state
    });
    
    // Listen for socket errors
    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('existingMessages');
        socketRef.current.off('error');
      }
    };
  }, [socketRef.current]);

  // Establish socket connection and handle events
  useEffect(() => {
    if (!socketRef.current) return;
    
    // Listen for new messages
    socketRef.current.on('newMessage', (message) => {
      console.log('Received newMessage:', message); // Debug log
      if (message.groupId === currentGroupId) {
        console.log('Adding message to state:', message); // Debug log
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage');
      }
    };
  }, [currentGroupId, socketRef.current]);

  // Join a group
  const joinGroup = (groupId) => {
    if (!socketRef.current) {
      console.error('Socket not connected');
      return;
    }
    
    console.log('Joining group:', groupId); // Debug log
    setCurrentGroupId(groupId);
    setMessages([]); // Clear previous messages
    socketRef.current.emit('joinGroup', groupId);
    console.log(`Joined group: ${groupId}`);
  };

  // Send a message
  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    
    if (!currentGroupId) {
      console.error('No group selected');
      return;
    }
    
    if (!userId) {
      console.error('User not authenticated');
      return;
    }
    
    if (!socketRef.current) {
      console.error('Socket not connected');
      return;
    }

    const message = {
      groupId: currentGroupId,
      senderId: userId,  // Changed from 'sender' to 'senderId' to match backend
      content: newMessage,
    };

    console.log('Sending message:', message); // Debug log
    socketRef.current.emit('sendMessage', message);
    setNewMessage(''); // Clear the input field
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB');
        return;
      }
      setSelectedFile(file);
      console.log('File selected:', file.name);
    }
  };

  // Upload file to group
  const uploadFile = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    if (!currentGroupId) {
      alert('Please select a group first');
      return;
    }

    if (!userId) {
      alert('User not authenticated');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('uploaderId', userId);

      console.log('Uploading file to group:', currentGroupId);

      const response = await axios.post(
  `/tasksphere/api/groups/${currentGroupId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      console.log('File uploaded successfully:', response.data);
      alert(`File "${selectedFile.name}" uploaded successfully!`);
      
      // Clear the file selection
      setSelectedFile(null);
      document.getElementById('fileInput').value = '';
      
      // Refresh the group data to show the new file
      // You could emit a socket event here to notify other users
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <div className="bg-stone-100 rounded-2xl m-2 p-6">
        <div className="flex justify-center font-bold text-3xl m-2 rounded-2xl">Connect</div>
        
        {!userId && (
          <div className="flex justify-center m-4 text-gray-600">
            Loading user information...
          </div>
        )}
        
        {userId && (
          <div className="bg-cyan-100 grid grid-cols-1 md:grid-cols-[30%_70%] rounded-2xl m-2 gap-4 p-4">
            {/* Project Groups Section */}
            <div className="bg-pink-100 rounded-2xl m-5 p-4">
              <h2 className="font-bold text-lg mb-4">Project Groups</h2>
              <div className="flex flex-col gap-2">
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <button
                      key={group._id}
                      onClick={() => joinGroup(group._id)}
                      className={`px-4 py-2 rounded ${currentGroupId === group._id
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                      {group.name}
                    </button>
                  ))
                ) : (
                  <p>No project groups available. Create a project to get started!</p>
                )}
              </div>
            </div>

            {/* Group Chats Section */}
            <div className="bg-amber-100 rounded-2xl m-5 p-4">
              <h2 className="font-bold text-lg mb-4">Group Chats</h2>
              {currentGroupId ? (
                <>
                  <div className="h-56 overflow-y-scroll bg-white p-2 rounded">
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mb-2">
                      Debug: Group ID: {currentGroupId}, Messages count: {messages.length}
                    </div>
                    {messages.length > 0 ? (
                      messages.map((message, index) => (
                        <div key={index} className="p-2 border-b">
                          {/* Use message.sender.email instead of senderId */}
                          <p className="font-bold">
                            {message.sender ? (message.sender.email || message.sender.name) : 'Unknown Sender'}
                          </p>
                          <p>{message.content}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                          {/* Debug info for each message */}
                          <p className="text-xs text-gray-400">
                            Debug: Sender ID: {message.sender?._id}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p>No messages yet.</p>
                    )}
                  </div>
                  
                  {/* Message input section */}
                  <div className="mt-4 space-y-2">
                    <div className="flex">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 p-2 border rounded-l"
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                      >
                        Send
                      </button>
                    </div>
                    
                    {/* File upload section */}
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <input
                        id="fileInput"
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
                      />
                      <label
                        htmlFor="fileInput"
                        className="bg-gray-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-gray-600 text-sm"
                      >
                        📎 Choose File
                      </label>
                      
                      {selectedFile && (
                        <span className="text-sm text-gray-600 flex-1">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      )}
                      
                      {selectedFile && !isUploading && (
                        <button
                          onClick={uploadFile}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                        >
                          Upload
                        </button>
                      )}
                      
                      {isUploading && (
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-blue-600">
                            Uploading... {uploadProgress}%
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {selectedFile && (
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            document.getElementById('fileInput').value = '';
                          }}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p>Select a group to view and send messages.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Connect;
