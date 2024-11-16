import React, { useState } from 'react';
import './App.css';
import './ContactProfesor.css';


const ContactProfesor = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here
  };

  // Temporary messages
  const messages = [
    { name: 'Student A', message: 'Can you please clarify the assignment details?' },
    { name: 'Student B', message: 'I need help with the last homework.' },
    { name: 'Student C', message: 'Do we have a test next week?' },
  ];

  return (
    <div className="content">
      {/* Form on the left */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="contact-form">
          <h2>Contact Form</h2>
          <label>
            Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          

          <label>
            Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          

          <label>
            Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          

          <button type="submit" className="button">Send</button>
        </form>
      </div>

      {/* Messages on the right */}
      <div className="messages-container">
        <h2>Recent Messages</h2>
        {messages.map((msg, index) => (
          <div key={index} className="message-card">
            <p><strong>{msg.name}</strong>: {msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactProfesor;
