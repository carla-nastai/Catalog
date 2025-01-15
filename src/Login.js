import React, { useState } from 'react';
import './Login.css';
import './App.css';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Pass email to parent component
        onLogin(data.email);
        localStorage.setItem('email', data.email); // Store email in localStorage
        navigate('/'); // Redirect to the Home page
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Unable to connect to the server');
    }
  };

  const goToSignIn = () => {
    navigate('/signin'); // Redirect to the Sign In page
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>

        {error && <Notification message={error} onClose={() => setError('')} />}

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
        <button onClick={goToSignIn} className="signin-button">Sign In</button>
      </form>
    </div>
  );
};

export default Login;
