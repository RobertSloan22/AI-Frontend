import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosConfig.js';
import { useAuthContext } from "../context/AuthContext";

const useLogin = () => {
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { setAuthUser } = useAuthContext();

	const login = async (username, password) => {
		setLoading(true);
		try {
			const response = await axiosInstance.post('/auth/login', {
				username,
				password
			});

			if (response.data && response.data.token) {
				localStorage.setItem('token', response.data.token);
				localStorage.setItem('chat-user', JSON.stringify(response.data.user));
				
				// Set auth user and wait for state to update
				await new Promise(resolve => {
					setAuthUser(response.data.user);
					// Give a small delay to ensure state is updated
					setTimeout(resolve, 100);
				});
				
				toast.success('Login successful!');
				navigate('/unified-dashboard');
				return true;
			}
			return false;
		} catch (error) {
			console.error('Login error:', error);
			if (error.code === 'ERR_NETWORK') {
				toast.error('Unable to connect to server. Please check if the server is running.');
			} else if (error.response?.status === 401) {
				toast.error('Invalid username or password');
			} else {
				toast.error('Login failed. Please try again.');
			}
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { loading, login };
};

export default useLogin;
