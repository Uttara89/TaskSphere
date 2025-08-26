import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { createSocket } from '../utils/socket';
import { useUserContext } from '../context/UserContext';
import backgroundImage from '../assets/image.png';

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

  // Helper function to get file icon based on file type
  const getFileIcon = (fileName, fileType) => {
    if (!fileName) return '📄';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType && fileType.startsWith('image/')) return '🖼️';
    
    switch (extension) {
      case 'pdf': return '📕';
      case 'doc':
      case 'docx': return '📘';
      case 'xls':
      case 'xlsx': return '📗';
      case 'ppt':
      case 'pptx': return '📙';
      case 'txt': return '📝';
      case 'zip':
      case 'rar':
      case '7z': return '🗜️';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎬';
      case 'mp3':
      case 'wav':
      case 'flac': return '🎵';
      default: return '📄';
    }
  };

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
  const joinGroup = async (groupId) => {
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

      const response = await api.post(
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
      
      // The file message will automatically appear via socket event
      
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
      <div 
        className="rounded-2xl m-2 p-6 relative"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Light overlay to make the background very subtle */}
        <div className="absolute inset-0 bg-stone-100/80 rounded-2xl"></div>
        
        {/* Content container */}
        <div className="relative z-10">
        <div className="flex justify-center font-bold text-3xl m-2 rounded-2xl">💬 Connect</div>
        
        {!userId && (
          <div className="flex justify-center m-4 text-gray-600">
            Loading user information...
          </div>
        )}
        
        {userId && (
          <div className="grid grid-cols-1 md:grid-cols-[30%_70%] rounded-2xl m-2 gap-6 p-4">
            {/* Project Groups Section */}
            <div 
              className="rounded-2xl m-5 p-6 relative shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/70 to-rose-100/70 rounded-2xl"></div>
              
              {/* Content container */}
              <div className="relative z-10">
              <h2 className="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">👥 Project Groups</h2>
              <div className="flex flex-col gap-3">
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <button
                      key={group._id}
                      onClick={() => joinGroup(group._id)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 ${currentGroupId === group._id
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-300'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-200'
                        }`}
                    >
                      🏢 {group.name}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-600 text-center p-4 bg-white/50 rounded-xl">📋 No project groups available. Create a project to get started!</p>
                )}
              </div>
              </div>
            </div>

            {/* Group Chats Section */}
            <div 
              className="rounded-2xl m-5 p-6 relative shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/70 to-yellow-100/70 rounded-2xl"></div>
              
              {/* Content container */}
              <div className="relative z-10">
              <h2 className="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">💬 Group Chats</h2>
              {currentGroupId ? (
                <>
                  <div className="h-64 overflow-y-scroll bg-white/60 p-4 rounded-xl shadow-inner backdrop-blur-sm border border-white/30">
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mb-2">
                      Debug: Group ID: {currentGroupId}, Messages count: {messages.length}
                    </div>
                    {messages.length > 0 ? (
                      messages.map((message, index) => (
                        <div key={index} className="p-4 mb-3 bg-white/80 rounded-lg shadow-sm border border-gray-200/50">
                          {/* Use message.sender.email instead of senderId */}
                          <p className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                            👤 {message.sender ? (message.sender.email || message.sender.name) : 'Unknown Sender'}
                          </p>
                          <p className="text-gray-700 leading-relaxed">{message.content}</p>
                          
                          {/* Display file attachment if present */}
                          {message.attachment && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600">
                                  {getFileIcon(message.attachment.fileName, message.attachment.fileType)}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-blue-800">
                                    {message.attachment.fileName}
                                  </p>
                                  <p className="text-xs text-blue-600">
                                    {message.attachment.fileSize ? 
                                      `${(message.attachment.fileSize / 1024 / 1024).toFixed(2)} MB` : 
                                      'Unknown size'
                                    }
                                  </p>
                                </div>
                                <a
                                  href={message.attachment.cloudinaryUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm"
                                >
                                  📥 Download
                                </a>
                                {/* Show preview for images */}
                                {message.attachment.fileType && message.attachment.fileType.startsWith('image/') && (
                                  <button
                                    onClick={() => window.open(message.attachment.cloudinaryUrl, '_blank')}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-sm"
                                  >
                                    👁️ View
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                            🕒 {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8 flex items-center justify-center gap-2">
                        💬 No messages yet. Start the conversation!
                      </p>
                    )}
                  </div>
                  
                  {/* Message input section */}
                  <div className="mt-6 space-y-3">
                    <div className="flex rounded-xl overflow-hidden shadow-lg">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 p-4 bg-white/80 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-500"
                        placeholder="✨ Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold"
                      >
                        🚀 Send
                      </button>
                    </div>
                    
                    {/* File upload section */}
                    <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl shadow-sm border border-white/30">
                      <input
                        id="fileInput"
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
                      />
                      <label
                        htmlFor="fileInput"
                        className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:from-gray-600 hover:to-gray-700 transition-all duration-300 text-sm font-medium shadow-sm"
                      >
                        📎 Choose File
                      </label>
                      
                      {selectedFile && (
                        <span className="text-sm text-gray-700 flex-1 bg-white/50 px-3 py-2 rounded-lg">
                          📄 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      )}
                      
                      {selectedFile && !isUploading && (
                        <button
                          onClick={uploadFile}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm font-medium shadow-sm"
                        >
                          ⬆️ Upload
                        </button>
                      )}
                      
                      {isUploading && (
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-blue-700 font-medium">
                            ⏳ Uploading... {uploadProgress}%
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-3 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm"
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
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium shadow-sm"
                        >
                          ❌ Remove
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-600 py-8 flex items-center justify-center gap-2">
                  🎯 Select a group to view and send messages.
                </p>
              )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default Connect;
