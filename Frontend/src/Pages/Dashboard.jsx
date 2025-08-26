import React from 'react'
import { Outlet } from 'react-router-dom'
import { useUserContext } from '../context/UserContext'
import Sidebar from '../componenets/Sidebar'

const Dashboard = () => {
  // Get user data from context (automatically syncs to MongoDB)
  const { clerkUser, dbUser, isLoaded, isUserSynced } = useUserContext();

  // Show loading state while Clerk loads user data
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to sign-in if no user (optional - Clerk handles this automatically)
  if (!clerkUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Please sign in to continue.</div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 ml-16 md:ml-56">
        <Outlet /> {/* Render child routes here */}
      </div>
    </div>
  )
}

export default Dashboard