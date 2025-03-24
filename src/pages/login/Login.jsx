import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useLogin from "../../hooks/useLogin";
import { Toaster } from 'react-hot-toast';
import { useAuthContext } from "../../context/AuthContext";

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const { loading, login } = useLogin();
	const { authUser } = useAuthContext();

	useEffect(() => {
		if (authUser) {
			navigate('/unified-dashboard');
		}
	}, [authUser, navigate]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		await login(username, password);
	};

	return (
		<div className='flex h-[100vh] w-[55vw] flex-col items-center justify-center min-w-96 mx-auto'>
			<div className='w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
				<h1 className='text-3xl font-semibold text-center text-white'>
					Login <span className='text-blue-500'>HD-Auto-Chat</span>
				</h1>

				<form onSubmit={handleSubmit}>
					<div>
						<label className='label p-2'>
							<span className='text-2xl label-text text-white'>Username</span>
						</label>
						<input
							type='text'
							placeholder='Enter username'
							className='w-full text-2xl input input-bordered h-10'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
					</div>

					<div>
						<label className='label'>
							<span className='text-2xl label-text text-white'>Password</span>
						</label>
						<input
							type='password'
							placeholder='Enter Password'
							className='w-full text-2xl input input-bordered h-10'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					<div>
						<button
							type="submit"
							className='btn text-xl label-text text-white btn-block btn-lg mt-4'
							disabled={loading}
						>
							{loading ? (
								<span className='loading loading-spinner'></span>
							) : (
								"Login"
							)}
						</button>
					</div>
				</form>

				<Link 
					to='/signup'
					className='text-xl label-text text-white hover:text-blue-600 mt-2 inline-block'
				>
					{"Don't have an account?"}
				</Link>
			</div>
			<Toaster position="top-center" reverseOrder={false} />
		</div>
	);
};

export default Login;
