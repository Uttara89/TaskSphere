import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import api from '../utils/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [isUserSynced, setIsUserSynced] = useState(false);

  useEffect(() => {
    const syncUserToDatabase = async () => {
      if (isLoaded && clerkUser && !isUserSynced) {
        try {
          const userData = {
            clerkUserId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress
          };

          console.log('Syncing user to database:', userData);

          const response = await api.post('/tasksphere/api/users', userData);
          
          setDbUser(response.data.user);
          setIsUserSynced(true);
          
          console.log('User synced successfully:', response.data);
        } catch (error) {
          console.error('Error syncing user to database:', error.response?.data || error.message);
        }
      }
    };

    syncUserToDatabase();
  }, [clerkUser, isLoaded, isUserSynced]);

  const value = {
    clerkUser,
    dbUser,
    isLoaded,
    isUserSynced,
    userId: dbUser?._id || null, // MongoDB ObjectId for use in your app
    clerkUserId: clerkUser?.id || null // Clerk ID
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
