import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { refreshToken, updateUser } from '../redux/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for token in localStorage on component mount
    const token = localStorage.getItem('sg_token');
    const userJson = localStorage.getItem('sg_user');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        dispatch(updateUser({ user }));
        dispatch(refreshToken({ token }));
      } catch (error) {
        console.error('Error parsing auth data from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('sg_token');
        localStorage.removeItem('sg_user');
      }
    }
  }, [dispatch]);

  // Function to manually refresh token (could be called from an interceptor)
  const handleTokenRefresh = (newToken: string) => {
    dispatch(refreshToken({ token: newToken }));
  };

  return { handleTokenRefresh };
};

export default useAuth;