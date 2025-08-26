import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useUserContext } from '../context/UserContext';
import backgroundImage from '../assets/image.png';

const Tasks = () => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [projectId, setProjectId] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [taskImportance, setTaskImportance] = useState('');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]); // New state for project members
const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [updateTaskId, setUpdateTaskId] = useState(null); // State to track the task being updated
  
  // Get the actual user ID from context instead of hardcoded value
  const { userId, dbUser, isUserSynced } = useUserContext();

  const updateFormRef = useRef(null);
  
  // Array of available gradient colors for tasks
  const taskColors = [
    'bg-gradient-to-br from-orange-200 to-rose-200',
    'bg-gradient-to-br from-cyan-200 to-teal-200',
    'bg-gradient-to-br from-violet-500 to-fuchsia-600',
    'bg-gradient-to-br from-amber-100 to-amber-300'
  ];
  
  // Function to get task color based on index
  const getTaskColor = (index) => {
    return taskColors[index % taskColors.length];
  };
  
  // Function to fetch project members
  const fetchProjectMembers = async (selectedProjectId) => {
    if (!selectedProjectId) {
      setProjectMembers([]);
      return;
    }
    
    try {
  const response = await api.get(`/tasksphere/api/projects/${selectedProjectId}/members`);
      setProjectMembers(response.data.members);
    } catch (error) {
      console.error('Error fetching project members:', error);
      setProjectMembers([]);
    }
  };

  // Fetch project members when projectId changes
  useEffect(() => {
    fetchProjectMembers(projectId);
  }, [projectId]);

  // Fetch all available projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
  const response = await api.get('/tasksphere/api/projects');
        setProjects(response.data); // Assuming response.data contains the array of projects
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  // Fetch all tasks assigned to the user
  useEffect(() => {
    const fetchUserTasks = async () => {
      // Wait for user to be synced before fetching tasks
      if (!userId || !isUserSynced) {
        console.log('Waiting for user sync before fetching tasks...');
        return;
      }

      try {
  const response = await api.get(`/tasksphere/user/${userId}/tasks`);
        console.log('Fetched user tasks:', response.data.tasks); // Debug log
        setTasks(response.data.tasks); // Assuming response.data.tasks contains the tasks array
      } catch (error) {
        console.error('Error fetching user tasks:', error);
      }
    };

    fetchUserTasks();
  }, [userId, isUserSynced]); // Add isUserSynced to dependencies

  // Extract fetchUserTasks function so it can be reused
  const fetchUserTasks = async () => {
    // Wait for user to be synced before fetching tasks
    if (!userId || !isUserSynced) {
      console.log('Waiting for user sync before fetching tasks...');
      return;
    }

    try {
  const response = await api.get(`/tasksphere/user/${userId}/tasks`);
      console.log('Fetched user tasks:', response.data.tasks); // Debug log
      setTasks(response.data.tasks); // Assuming response.data.tasks contains the tasks array
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    }
  };

  // Call fetchUserTasks when component mounts or dependencies change
  useEffect(() => {
    fetchUserTasks();
  }, [userId, isUserSynced]); // Add isUserSynced to dependencies

  // Fetch all notes created by the user
  useEffect(() => {
    const fetchUserNotes = async () => {
      // Wait for user to be synced before fetching notes
      if (!userId || !isUserSynced) {
        console.log('Waiting for user sync before fetching notes...');
        return;
      }

      try {
  const response = await api.get(`/tasksphere/user/${userId}/notes`);
        if (response.data.notes.length > 0) {
          // Assuming the user has only one note, set the content of the first note
          setNotes(response.data.notes[0].content);
        } else {
          setNotes(''); // Set to an empty string if no notes exist
        }
      } catch (error) {
        console.error('Error fetching user notes:', error);
      }
    };
  
    fetchUserNotes();
  }, [userId, isUserSynced]); // Add isUserSynced to dependencies

  const saveNotes = async () => {
    try {
  const response = await api.put('/tasksphere/notes/67e5609ab462fae99098b27c', {
        content: notes,
      });
      console.log('Notes saved successfully:', response.data);
      setMessage('Notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error.response?.data?.message || error.message);
      setMessage('Error saving notes');
    }
  };

  const addTask = async () => {
    if (taskTitle.trim()) {
      try {
  const response = await api.post('/tasksphere/api/tasks', {
          title: taskTitle,
          assigneeEmail: taskAssignee,
          projectId,
          deadline: deadlineDate,
          importance: taskImportance,
        });

        setTasks([...tasks, response.data.task]); // Add the new task to the local state
        setTaskTitle('');
        setTaskAssignee('');
        setProjectId('');
        setDeadlineDate('');
        setTaskImportance('');
        setMessage('Task created successfully!');
        
        // Refresh the task list to ensure it's up to date
        await fetchUserTasks();
      } catch (error) {
        console.error('Error creating task:', error.response?.data?.message || error.message);
        setMessage(error.response?.data?.message || 'Error creating task');
      }
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
  const response = await api.put(`/tasksphere/api/tasks/${updateTaskId}`, {
        title: taskTitle,
        assigneeEmail: taskAssignee,
        projectId,
        deadline: deadlineDate,
        importance: taskImportance,
      });
  
      // Update the task in the local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updateTaskId ? response.data.task : task
        )
      );
  
      // Reset the update form
      setUpdateTaskId(null);
      setTaskTitle('');
      setTaskAssignee('');
      setProjectId('');
      setDeadlineDate('');
      setTaskImportance('');
      setMessage('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error.response?.data?.message || error.message);
      setMessage(error.response?.data?.message || 'Error updating task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    // Confirm before deleting
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
  await api.delete(`/tasksphere/api/tasks/${taskId}`);
        
        // Remove the task from the local state
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
        setMessage('Task deleted successfully!');
      } catch (error) {
        console.error('Error deleting task:', error.response?.data?.message || error.message);
        setMessage(error.response?.data?.message || 'Error deleting task');
      }
    }
  };

  // Function to mark task as complete
  const handleMarkTaskComplete = async (task) => {
    if (task.completed) {
      setMessage('Task is already completed!');
      return;
    }

    if (!task.project?._id) {
      setMessage('Cannot complete task: No project associated');
      return;
    }

    try {
  const response = await api.put(`/tasksphere/api/tasks/${task._id}/${task.project._id}/complete`);
      
      console.log('Task marked as complete:', response.data);
      
      // Update the task in local state
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === task._id ? { ...t, completed: true } : t
        )
      );
      
      setMessage('Task marked as complete! Project progress updated.');
    } catch (error) {
      console.error('Error marking task as complete:', error);
      setMessage(error.response?.data?.message || 'Error marking task as complete');
    }
  };

  const cancelUpdate = () => {
    // Reset the update form
    setUpdateTaskId(null);
    setTaskTitle('');
    setTaskAssignee('');
    setProjectId('');
    setDeadlineDate('');
    setTaskImportance('');
    setProjectMembers([]);
    setMessage('');
  };

  const clearForm = () => {
    // Clear the task creation form
    setTaskTitle('');
    setTaskAssignee('');
    setProjectId('');
    setDeadlineDate('');
    setTaskImportance('');
    setProjectMembers([]);
    setMessage('');
  };

  const openUpdateForm = (task) => {
    setUpdateTaskId(task._id);
    setTaskTitle(task.title);
    setTaskAssignee(task.assignee?.email || ''); // Fixed: use task.assignee.email instead of task.assigneeEmail
    setProjectId(task.project?._id || '');
    setDeadlineDate(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
    setTaskImportance(task.importance);

    // Fetch project members if project is selected
    if (task.project?._id) {
      fetchProjectMembers(task.project._id);
    }
  
    // Scroll to the update form
    if (updateFormRef.current) {
      updateFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask();
  };

  // Show loading state if user isn't synced yet
  if (!isUserSynced || !userId) {
    return (
      <div className="bg-stone-100 rounded-3xl p-1">
        <div className="flex justify-center font-bold text-3xl m-2">Tasks</div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading user data...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className=" rounded-3xl p-1 relative"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Light overlay to make the background very subtle */}
        <div className="absolute inset-0 bg-stone-100/80 rounded-3xl"></div>
        
        {/* Content container */}
        <div className="relative z-10">
        <div className="flex justify-center font-bold text-3xl m-2">Tasks</div>
        <div className="grid grid-cols-1 w-[100%] sm:grid-cols-2 justify-end">
          {/* Assigned to Me Section */}
          <div 
            className="flex flex-col md:ml-[20px] p-5 rounded-3xl m-5 sm:w-[90%] h-[90%] relative"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Faded overlay */}
            <div className="absolute inset-0 bg-white/60 rounded-3xl"></div>
            
            {/* Content container */}
            <div className="relative z-10">
            {/* <h1>Tasks Assigned to Me</h1> */}
            <ul>
              {tasks.filter(task => !task.completed).length > 0 ? (
                tasks.filter(task => !task.completed).map((task, index) => (
                  <li key={task._id} className="p-4 bg-white/50 mb-4 rounded-lg shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] hover:shadow-xl transition-shadow duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 text-gray-800">
                        <h3 className="font-bold text-gray-900">{task.title}</h3>
                        <p className="text-gray-700">Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</p>
                        <p className="text-gray-700">Importance: <span className={`px-2 py-1 rounded text-xs ${
                          task.importance === 'High' || task.importance === 'high' ? 'bg-red-100 text-red-800' :
                          task.importance === 'Medium' || task.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.importance || 'N/A'}
                        </span></p>
                        <p className="text-gray-700">Project: {task.project?.name || 'N/A'}</p>
                        <p className="text-gray-700">Assignee: {task.assignee?.email || task.assignee?.name || 'N/A'}</p>
                        <p className="text-gray-700">Status: <span className={`px-2 py-1 rounded text-xs ${
                          task.completed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {task.completed ? '✓ Completed' : '○ Pending'}
                        </span></p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        onClick={() => openUpdateForm(task)}
                      >
                        Update Task
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        Delete Task
                      </button>
                      {!task.completed && (
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          onClick={() => handleMarkTaskComplete(task)}
                        >
                          ✓ Mark Complete
                        </button>
                      )}
                      {task.completed && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <p>No pending tasks assigned to you.</p>
              )}
            </ul>
            </div>
          </div>

          {/* Notes Section */}
        <div 
          className="flex flex-col p-5 rounded-3xl m-5 sm:w-[90%] h-[90%] relative"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Faded overlay */}
          <div className="absolute inset-0 bg-stone-100/60 rounded-3xl"></div>
          
          {/* Content container */}
          <div className="relative z-10 flex flex-col h-full">
  {/* <h1>Notes</h1> */}
  <textarea
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    className="flex-1 shadow appearance-none rounded-2xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none bg-white/60"
    placeholder="Write your notes here..."
  />
  <button
    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    onClick={() => saveNotes()}
  >
    Save Notes
  </button>
  </div>
</div>
        </div>

        {/* Add Task Form */}
        <div className="flex justify-center">
          <div 
            className="p-8 rounded-3xl m-5 w-full md:w-[55%] shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] relative"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Faded overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-indigo-100/60 rounded-3xl"></div>
            
            {/* Content container */}
            <div className="relative z-10">
            <h1 className="flex justify-center text-2xl font-bold text-gray-800 mb-6">✨ Add New Task</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
              <div className="mb-6 w-full space-y-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="taskTitle">
                  📝 Task Title
                </label>
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                  id="taskTitle"
                  type="text"
                  placeholder="Enter task title"
                  required
                />
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="taskAssignee">
                  👥 Assign Task
                </label>
                {projectId && projectMembers.length > 0 ? (
                  <select
                    id="taskAssignee"
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                    required
                  >
                    <option value="">Select a team member</option>
                    {projectMembers.map((member) => (
                      <option key={member._id} value={member.email}>
                        {member.name || member.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    id="taskAssignee"
                    className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                    placeholder={projectId ? "Loading team members..." : "Select a project first or enter email manually"}
                    required
                  />
                )}
                <label htmlFor="projectId" className="block text-gray-700 text-sm font-semibold mb-2">
                  📁 Select Project
                </label>
                <select
                  id="projectId"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <label htmlFor="deadlineDate" className="block text-gray-700 text-sm font-semibold mb-2">
                  📅 Set Deadline
                </label>
                <input
                  type="date"
                  id="deadlineDate"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                  required
                />
                <label htmlFor="taskImportance" className="block text-gray-700 text-sm font-semibold mb-2">
                  ⚡ Task Importance
                </label>
                <select
                  id="taskImportance"
                  required
                  value={taskImportance}
                  onChange={(e) => setTaskImportance(e.target.value)}
                  className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                >
                  <option value="">Select importance level</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <div className="mt-8 flex gap-4">
                  <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]" type="submit">
                    ✨ Add Task
                  </button>
                  <button 
                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-gray-500 hover:to-gray-600 transform hover:scale-105 transition-all duration-300 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]" 
                    type="button"
                    onClick={clearForm}
                  >
                    🗑️ Clear All
                  </button>
                </div>
              </div>
            </form>
            {message && (
              <p className={`mt-4 text-center font-medium ${
                message.includes('successfully') 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {message}
              </p>
            )}
            </div>
          </div>
        </div>
                  <div >
        {/* Update Task Form */}
        {updateTaskId && (
          <div ref={updateFormRef} className="flex justify-center">
            <div 
              className="p-8 rounded-3xl m-5 w-full md:w-[55%] shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] relative"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Faded overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 to-emerald-100/60 rounded-3xl"></div>
              
              {/* Content container */}
              <div className="relative z-10">
              <h1 className="flex justify-center text-2xl font-bold text-gray-800 mb-6">🔄 Update Task</h1>
              <form onSubmit={handleUpdateTask} className="w-full max-w-md mx-auto">
                <div className="mb-6 w-full space-y-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="taskTitle">
                    📝 Task Title
                  </label>
                  <input
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                    id="taskTitle"
                    type="text"
                    placeholder="Enter task title"
                    required
                  />
                  <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="taskAssignee">
                    👥 Assign Task
                  </label>
                  {projectId && projectMembers.length > 0 ? (
                    <select
                      id="taskAssignee"
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                    >
                      <option value="">Select a team member</option>
                      {projectMembers.map((member) => (
                        <option key={member._id} value={member.email}>
                          {member.name || member.email}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      id="taskAssignee"
                      className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                      placeholder={projectId ? "Loading team members..." : "Select a project first or enter email manually"}
                    />
                  )}
                  <label htmlFor="projectId" className="block text-gray-700 text-sm font-semibold mb-2">
                    📁 Select Project
                  </label>
                  <select
                    id="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="deadlineDate" className="block text-gray-700 text-sm font-semibold mb-2">
                    📅 Set Deadline
                  </label>
                  <input
                    type="date"
                    id="deadlineDate"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                  />
                  <label htmlFor="taskImportance" className="block text-gray-700 text-sm font-semibold mb-2">
                    ⚡ Task Importance
                  </label>
                  <select
                    id="taskImportance"
                    value={taskImportance}
                    onChange={(e) => setTaskImportance(e.target.value)}
                    className="w-full py-3 px-4 bg-white/40 rounded-xl border-2 border-gray-200 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:bg-blue-50 transition-all duration-300 shadow-sm"
                  >
                    <option value="">Select importance level</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <div className="mt-8 flex gap-4">
                    <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]" type="submit">
                      🔄 Update Task
                    </button>
                    <button 
                      className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-gray-500 hover:to-gray-600 transform hover:scale-105 transition-all duration-300 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]" 
                      type="button"
                      onClick={cancelUpdate}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}
        </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;