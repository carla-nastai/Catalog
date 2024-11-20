import React, { useState } from 'react';
import './App.css';
import './ContactProfesor.css';

const ContactProfesor = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]); // State to store submitted messages
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add the new message to the messages array
    setMessages((prevMessages) => [
      ...prevMessages,
      { name, email, message },
    ]);
    // Clear the form fields
    setName('');
    setEmail('');
    setMessage('');
  };

  const handleMessageClick = (msg) => {
    setSelectedMessage(msg);
    setShowMessageModal(true);
  };

  const handleRespondClick = () => {
    setShowRespondModal(true);
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

  const handleCloseRespondModal = () => {
    setShowRespondModal(false);
  };

  const handleSendResponse = (event) => {
    event.preventDefault();
    console.log('Response sent to:', selectedMessage.email);
    setShowMessageModal(false);
    setShowRespondModal(false);
  };

  return (
    <div className="content">
      {/* Form on the left */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="contact-form">
          <h2>Contact Form</h2>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            Message:
            <textarea
              className="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </label>

          <button type="submit" className="button">Send</button>
        </form>
      </div>

      {/* Messages on the right */}
      <div className="messages-container">
        <h2>Recent Messages</h2>
        {messages.map((msg, index) => (
          <div
            key={index}
            className="message-card"
            onClick={() => handleMessageClick(msg)}
          >
            <p><strong>{msg.name}</strong>: {msg.message}</p>
          </div>
        ))}
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedMessage && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={handleCloseMessageModal}>X</button>
            <h3>{selectedMessage.name}'s Message</h3>
            <p><strong>Email:</strong> {selectedMessage.email}</p>
            <p><strong>Message:</strong> {selectedMessage.message}</p>
            <button className="respond-btn" onClick={handleRespondClick}>Respond</button>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {showRespondModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={handleCloseRespondModal}>X</button>
            <h3>Respond to {selectedMessage.name}</h3>
            <form onSubmit={handleSendResponse}>
              <label className="modal-label">
                To:
                <input
                  type="email"
                  value={selectedMessage.email}
                  readOnly
                  disabled
                />
              </label>
              <label className="modal-label">
                Your Response:
                <textarea
                  className="message"
                  placeholder="Type your response here..."
                  required
                ></textarea>
              </label>
              <button type="submit" className="button">Send Response</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactProfesor;
