import './App.css';  
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './Home';
import ContactProfesor from './ContactProfesor';
import Login from './Login';
import Timetable from './Timetable';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // Set initial state to null
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  useEffect(() => {
    // This runs once on mount, and checks localStorage
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false); // Explicitly set to false if not logged in
    }
  }, []);

  if (isLoggedIn === null) {
    // Don't load the page before checking the login status from localStorage
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="container">
        <div className="header-nav-container">
          <div className="header">
            <h1>Catalog</h1>
          </div>
          <nav className="nav">
            <div className="main-nav-menu">
            {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
              <Link to="/">Home</Link>
              <Link to="/contact-profesor">Contact</Link>
              <Link to="/orar">Orar</Link>
            </div>

            <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <div></div>
              <div></div>
              <div></div>
            </div>

            {/* Sidebar Menu */}
            <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/contact-profesor" onClick={() => setMenuOpen(false)}>Contact</Link>
              <Link to="/orar" onClick={() => setMenuOpen(false)}>Orar</Link>
            </div>
          </nav>
        </div>

        {/* Backdrop */}
        <div
          className={`backdrop ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        ></div>

        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
          <Route path="/contact-profesor" element={isLoggedIn ? <ContactProfesor /> : <Navigate to="/login" />} />
          <Route path="/orar" element={isLoggedIn ? <Timetable /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
