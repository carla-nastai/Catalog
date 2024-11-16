import React, { useState } from 'react';
import './Login.css';
import './App.css';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Default admin credentials
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    
    // Check if the entered credentials match the admin ones
    if (username === adminUsername && password === adminPassword) {
      onLogin(); // Notify parent component of successful login
      navigate('/'); // Redirect to the Home page
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>

        {error && <p className="error-message">{error}</p>}

        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
  );
};

export default Login;
