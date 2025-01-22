import React, { useState, useEffect } from 'react';
import './Registration.css';
import axios from 'axios';

function Registration() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setLoggedInUser(parsedUser.username);
            setIsLoggedIn(true);
        }
    }, []);

    const handleSubmit = async () => {
        if (isLoginMode) {
            try {
                const response = await axios.post('http://localhost:5000/login', {
                    username: username,
                    password: password,
                });

                localStorage.setItem('token', response.data.token);
                localStorage.setItem('loggedInUser', JSON.stringify({ username }));
                alert(`${username} logged in successfully`);
                setIsLoggedIn(true);
                setLoggedInUser(username);

                // ✅ Reload to make sure the UI updates correctly
                window.location.reload();

            } catch (error) {
                alert('Error occurred: ' + error.response.data);
            }
        } else {
            try {
                await axios.post('http://localhost:5000/register', {
                    username: username,
                    password: password,
                });

                localStorage.setItem('loggedInUser', JSON.stringify({ username }));
                alert('Registered successfully');
                setIsLoggedIn(true);
                setLoggedInUser(username);

                // ✅ Reload after registration
                window.location.reload();

            } catch (error) {
                alert('Error trying to register' + error.response.data);
            }
        }
        setUsername('');
        setPassword('');
    };

    const handleLogout = () => {
        console.log("🚪 Logging out... Clearing session.");
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setLoggedInUser(null);

        // ✅ Force reload to update UI
        window.location.reload();
    };

    return (
        <div className="auth-container">
            {isLoggedIn ? (
                <div>
                    <p className="welcome-text">👋 Hello, {loggedInUser}</p>
                    <button onClick={handleLogout}>Log Out</button>
                </div>
            ) : (
                <div>
                    <h3>{isLoginMode ? 'Login' : 'Register'}</h3>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleSubmit}>
                        {isLoginMode ? 'Login' : 'Register'}
                    </button>
                    <p onClick={() => setIsLoginMode(!isLoginMode)}>
                        {isLoginMode ? "Don't have an account? Register" : 'Already have an account? Login'}
                    </p>
                </div>
            )}
        </div>
    );
}

export default Registration;
