import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useUserContext } from '../context/UserContext';
import backgroundImage from '../assets/image.png';

const Projects = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState('');
  const [message, setMessage] = useState('');

  // fetch user projects
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // Selected project for progress view
  const [projectProgress, setProjectProgress] = useState(null); // Progress data
  const [loadingProgress, setLoadingProgress] = useState(false); // Loading state

  // Get the actual user ID from context instead of hardcoded value
  const { userId, dbUser, isUserSynced } = useUserContext();
  
  console.log('Projects - Current userId:', userId);
  console.log('Projects - Is user synced:', isUserSynced);

  //? handle form submission to create a project
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Split members by comma and trim spaces
    const memberEmails = members.split(',').map(email => email.trim());

    try {
  const response = await api.post('/tasksphere/api/projects', {
        name,
        description,
        members: memberEmails,
      });

      setMessage(`Project created successfully: ${response.data.project.name}`);
      setName('');
      setDescription('');
      setMembers('');
      
      // Refresh the projects list after successful creation
      fetchUserProjects();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating project');
    }
  };

  // Fetch projects for the current user
  const fetchUserProjects = async () => {
    if (!userId) {
      console.log('Projects: No userId available yet, skipping fetch');
      return;
    }
    
    console.log('Projects: Fetching projects for userId:', userId);
    
    try {
  const response = await api.get(`/tasksphere/user/${userId}/projects`);
      console.log('Projects: API response:', response.data);
      setUserProjects(response.data.projects || []);
    } catch (error) {
      console.error('Projects: Error fetching projects:', error);
      setUserProjects([]);
    }
  };

  //? fetch all user projects
  useEffect(() => {
    fetchUserProjects();
  }, [userId]); // Re-fetch when userId changes

  // Fetch project progress
  const fetchProjectProgress = async (projectId) => {
    setLoadingProgress(true);
    try {
  const response = await api.get(`/tasksphere/api/projects/${projectId}/progress`);
      setProjectProgress(response.data);
      console.log('Project progress data:', response.data);
    } catch (error) {
      console.error('Error fetching project progress:', error);
      setMessage('Error fetching project progress');
    } finally {
      setLoadingProgress(false);
    }
  };

  // Handle project selection
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    fetchProjectProgress(project._id);
  };

  //? delete a project
  const handleDelete = async (projectId) => {
    if (!userId) {
      console.log('Projects: No userId available for delete operation');
      return;
    }

    try {
  await api.delete(`/tasksphere/api/projects/${projectId}`);
      setMessage('Project deleted successfully.');
  
      // Refresh the user projects list
      fetchUserProjects();
    } catch (error) {
      console.error('Projects: Error deleting project:', error);
      setMessage(error.response?.data?.message || 'Error deleting project');
    }
  };

  // Circular Progress Bar Component
  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10b981"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        <div className="absolute text-xl font-bold text-green-600">
          {percentage}%
        </div>
      </div>
    );
  };

  return (
    <div 
      className='rounded-2xl m-1 relative'
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Light overlay to make the background very subtle */}
      <div className="absolute inset-0 bg-gray-100/80 rounded-2xl"></div>
      
      {/* Content container */}
      <div className="relative z-10">
      <div className="flex justify-center font-bold text-3xl m-2 text-slate-800">🚀 Projects</div>
      
      {!userId && (
        <div className="flex justify-center m-4 text-gray-600">
          Loading user information...
        </div>
      )}
      
      {userId && (
        <div 
          className='flex justify-center overflow-y-scroll h-64 rounded-2xl m-2 border border-blue-200 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] relative'
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Light overlay */}
          <div className="absolute inset-0 bg-blue-50/80 rounded-2xl"></div>
          <div className="w-full p-6 relative z-10">
            <p className="text-center font-bold mb-6 text-2xl text-blue-800 flex items-center justify-center gap-2">
              <span className="text-2xl">📁</span> All User Projects
            </p>
            <ul className="space-y-3">
              {userProjects.length > 0 ? (
                userProjects.map((project) => (
                  <li key={project._id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                    <div className="p-4 flex justify-between items-center">
                      <button
                        onClick={() => handleProjectSelect(project)}
                        className={`flex-1 text-left p-3 rounded-xl transition-all duration-200 ${
                          selectedProject?._id === project._id 
                            ? 'bg-gradient-to-r from-blue-200 to-indigo-200 border-2 border-blue-400 shadow-md' 
                            : 'hover:bg-blue-50'
                        }`}
                      >
                        <h3 className="font-bold text-blue-800 text-lg">{project.name}</h3>
                        <p className="text-blue-600 text-sm mt-1">{project.description}</p>
                        <p className="text-blue-500 text-xs mt-2 flex items-center gap-1">
                          <span>👥</span> {project.members?.length || 0} members
                        </p>
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 ml-4"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-blue-600 text-lg">📝 No projects found.</p>
                  <p className="text-blue-500 text-sm mt-2">Create your first project to get started!</p>
                </div>
              )}
            </ul>
          </div>
        </div>
      )}
      <div className='grid grid-cols-1 md:grid-cols-2 rounded-2xl m-2 gap-4'>
        {/* Create a Project Section */}
        <div 
          className='rounded-2xl m-2 overflow-y-scroll p-6 border border-emerald-200 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] relative'
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Light overlay */}
          <div className="absolute inset-0 bg-emerald-50/80 rounded-2xl"></div>
          <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-6 text-emerald-800 flex items-center gap-2">
            <span className="text-2xl">📋</span> Create a Project
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block font-bold text-emerald-700 mb-2">Project Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg"
                placeholder="Enter project name..."
                required
              />
            </div>
            <div>
              <label className="block font-bold text-emerald-700 mb-2">Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg resize-none"
                placeholder="Describe your project..."
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-emerald-700 mb-2">Members (comma-separated emails):</label>
              <input
                type="text"
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                className="w-full p-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all duration-200 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg"
                placeholder="user1@email.com, user2@email.com..."
                required
              />
            </div>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-bold text-lg shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] hover:shadow-xl transform hover:scale-[1.02]"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl">🚀</span> Create Project
              </span>
            </button>
          </form>
          {message && (
            <div className="mt-6 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-emerald-200 shadow-md">
              <p className="text-center font-medium text-emerald-800">{message}</p>
            </div>
          )}
          </div>
        </div>

        {/* Select Project Section */}
        <div 
          className='rounded-2xl m-2 p-6 overflow-y-scroll border border-purple-200 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] relative'
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Light overlay */}
          <div className="absolute inset-0 bg-purple-50/80 rounded-2xl"></div>
          <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-6 text-purple-800 flex items-center gap-2">
            <span className="text-2xl">📊</span> Project Progress
          </h2>
          
          {!selectedProject ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-purple-600 text-lg font-medium">Select a project from the list above</p>
              <p className="text-purple-500 text-sm mt-2">to view its progress and statistics.</p>
            </div>
          ) : loadingProgress ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-purple-600 font-medium">Loading project progress...</div>
            </div>
          ) : projectProgress ? (
            <div className="space-y-6">
              {/* Project Header */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-purple-200">
                <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                  <span className="text-xl">🚀</span> {projectProgress.project.name}
                </h3>
                <p className="text-purple-600 mt-2">{projectProgress.project.description}</p>
                <p className="text-purple-500 text-sm mt-3 flex items-center gap-1">
                  <span>👥</span> {projectProgress.project.members.length} members
                </p>
              </div>

              {/* Progress Circle */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-purple-800 text-lg flex items-center gap-2">
                      <span>📈</span> Overall Progress
                    </h4>
                    <div className="text-sm text-purple-600 mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">📋</span>
                        <p>Total Tasks: <span className="font-semibold">{projectProgress.statistics.totalTasks}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✅</span>
                        <p>Completed: <span className="font-semibold text-green-600">{projectProgress.statistics.completedTasks}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-500">⏳</span>
                        <p>Pending: <span className="font-semibold text-orange-600">{projectProgress.statistics.pendingTasks}</span></p>
                      </div>
                    </div>
                  </div>
                  <CircularProgress percentage={projectProgress.statistics.progressPercentage} />
                </div>
              </div>



              {/* Upcoming Deadlines */}
              {projectProgress.upcomingDeadlines > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 shadow-md">
                  <h4 className="font-bold text-orange-800 mb-3 text-lg flex items-center gap-2">
                    <span className="text-xl">⚠️</span> Upcoming Deadlines
                  </h4>
                  <p className="text-orange-700">
                    {projectProgress.upcomingDeadlines} task(s) due in the next 7 days
                  </p>
                </div>
              )}

              {/* Recent Tasks */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-md border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-4 text-lg flex items-center gap-2">
                  <span className="text-xl">📝</span> Recent Tasks
                </h4>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {projectProgress.recentTasks.length > 0 ? (
                    projectProgress.recentTasks.map((task, index) => (
                      <div key={index} className="bg-white/50 rounded-lg p-3 border border-purple-100 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <span className={`flex-1 font-medium ${task.completed ? 'line-through text-gray-500' : 'text-purple-700'}`}>
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              task.importance === 'High' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800' :
                              task.importance === 'Medium' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' :
                              'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                            }`}>
                              {task.importance}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              task.completed ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                            }`}>
                              {task.completed ? '✓' : '○'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-purple-500 text-sm">📋 No tasks in this project yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">❌</div>
              <p className="text-red-600 font-medium">Error loading project progress.</p>
              <p className="text-red-500 text-sm mt-1">Please try again.</p>
            </div>
          )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Projects;