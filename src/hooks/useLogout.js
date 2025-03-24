import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const useLogout = () => {
	const { setAuthUser } = useAuthContext();
	const navigate = useNavigate();

	const logout = () => {
		try {
			localStorage.removeItem('chat-user');
			localStorage.removeItem('token');
			setAuthUser(null);
			toast.success('Logged out successfully');
			navigate('/login');
		} catch (error) {
			console.error('Logout error:', error);
			toast.error('Failed to logout. Please try again.');
		}
	};

	return { logout };
};
