import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import api from '../utils/api';

const useUserSync = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUserToDatabase = async () => {
      if (isLoaded && user) {
        try {
          // Get user data from Clerk
          const userData = {
            clerkUserId: user.id,
            email: user.primaryEmailAddress?.emailAddress
          };

          console.log('Syncing user to database:', userData);

          // Send user data to your backend
          const response = await api.post('/tasksphere/api/users', userData);
          
          console.log('User sync response:', response.data);
        } catch (error) {
          console.error('Error syncing user to database:', error.response?.data || error.message);
        }
      }
    };

    syncUserToDatabase();
  }, [user, isLoaded]);

  return { user, isLoaded };
};

export default useUserSync;
