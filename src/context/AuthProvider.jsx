import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const AuthContextProvider = ({ children }) => {
	const [authUser, setAuthUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem("chat-user"));
		setAuthUser(user);
		setLoading(false);
	}, []);

	const logoutUser = () => {
		localStorage.removeItem("chat-user");
		localStorage.removeItem("token");
		setAuthUser(null);
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<AuthContext.Provider value={{ authUser, setAuthUser, logoutUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuthContext must be used within an AuthContextProvider');
	}
	return context;
}; 