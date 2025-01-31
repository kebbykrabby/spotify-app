import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './login.css';

const preventRefresh = (e) => {
	e.preventDefault();
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
	return (
		<div className="login-wrapper">
			<div className="form">
				<div className="heading">LOGIN</div>
				<form>
					<div>
						<label htmlFor="username">username</label>
						<input value={username} type="text" id="username" placeholder="Enter your username" />
					</div>
					<div>
						<label htmlFor="password">password</label>
						<input value={password} type="password" id="password" placeholder="Enter you password" />
					</div>
					<button type="submit" onClick={preventRefresh}>
						Submit
					</button>
				</form>
				<p>
					Don't have an account ? <Link to="/signup"> Sign In </Link>
				</p>
			</div>
		</div>
	);
}
