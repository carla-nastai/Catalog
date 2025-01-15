import React, { useState } from 'react';
import './Signin.css';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification';

const Signin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isStudent, setIsStudent] = useState(false); // State pentru checkbox
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, isStudent }), // Trimitem și isStudent
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Sign-in failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Unable to connect to the server');
    }
  };

  const handleCheckboxChange = (e) => {
    setIsStudent(e.target.checked);
  };

  return (
    <div className="signin-container">
      <form onSubmit={handleSubmit} className="signin-form">
  <h2>Sign In</h2>

  {error && <Notification message={error} onClose={() => setError('')} />}
  {success && <Notification message={success} onClose={() => setSuccess('')} />}

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
    Email:
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
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

  {/* Checkbox pentru "Are you a student?" */}
  <label className="checkbox">
    <input
      type="checkbox"
      checked={isStudent}
      onChange={(e) => setIsStudent(e.target.checked)}
      required
    />
    Are you a student?
  </label>

  <button type="submit" className="signin-button">Sign In</button>
</form>

    </div>
  );
};

export default Signin;
