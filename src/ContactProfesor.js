import React, { useState, useEffect } from 'react';
import './App.css';
import './ContactProfesor.css';

const ContactProfesor = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // Mesajul de contact
  const [messages, setMessages] = useState([]); // State to store submitted messages
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [responseName, setResponseName] = useState(''); // State for the response name
  const [responseMessage, setResponseMessage] = useState(''); // Mesajul de răspuns

  useEffect(() => {
    // Get email from LocalStorage
    const userEmail = localStorage.getItem('email');
    
    if (userEmail) {
      // Fetch messages for the user
      fetch(`http://localhost:5000/api/messages?receiver_email=${userEmail}`)
        .then((response) => response.json())
        .then((data) => {
          setMessages(data); // Update state with messages
        })
        .catch((error) => console.error('Error fetching messages:', error));
    }
  }, []); // Only run once when the component is mounted

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userEmail = localStorage.getItem('email'); // Get the email from localStorage
    
    const newMessage = {
      sender_name: name,
      sender_email: userEmail,
      receiver_email: email,
      message_content: message,
    };

    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Message sent successfully:', data);
        // Clear form fields
        setName('');
        setEmail('');
        setMessage('');
      } else {
        console.error('Error sending message:', data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
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

  const handleSendResponse = async (event) => {
    event.preventDefault();
    const senderName = responseName; // Name from the response input
    const senderEmail = localStorage.getItem('email'); // Sender email from LocalStorage
    const receiverEmail = selectedMessage.sender_email; // Receiver's email (sender of original message)
    const messageContent = responseMessage; // Folosește `responseMessage`

    const responseData = {
      sender_name: senderName,
      sender_email: senderEmail,
      receiver_email: receiverEmail,
      message_content: messageContent,
      original_message_id: selectedMessage.id, // Link to the original message
    };

    try {
      const response = await fetch('http://localhost:5000/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Response sent successfully:', data);
        setShowMessageModal(false);
        setShowRespondModal(false);
        setResponseMessage(''); // Clear the response message
      } else {
        console.error('Error sending response:', data);
      }
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        // Remove the deleted message from the state
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
        console.log('Message deleted successfully');
      } else {
        console.error('Error deleting message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
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
            Email Receiver:
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
              onChange={(e) => setMessage(e.target.value)} // Folosește `message` pentru formularul de contact
              required
            ></textarea>
          </label>

          <button type="submit" className="button">Send</button>
        </form>
      </div>

      {/* Messages on the right */}
      <div className="messages-container">
        <h2>Recent Messages</h2>
        {messages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className="message-card"
              onClick={() => handleMessageClick(msg)} // Open modal on click
            >
              <p><strong>{msg.sender_name}</strong>: {msg.message_content}</p>
            </div>
          ))
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedMessage && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={handleCloseMessageModal}>X</button>
            <h3>{selectedMessage.sender_name}'s Message</h3>
            <p><strong>Email:</strong> {selectedMessage.sender_email}</p>
            <p><strong>Message:</strong> {selectedMessage.message_content}</p>

            {/* Respond Button */}
            <button className="respond-btn" onClick={handleRespondClick}>
              Respond
            </button>

            {/* Delete Button */}
            <button
              className="delete-btn"
              onClick={() => handleDeleteMessage(selectedMessage.id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {showRespondModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={handleCloseRespondModal}>X</button>
            <h3>Respond to {selectedMessage.sender_name}</h3>
            <form onSubmit={handleSendResponse}>
              <label className="modal-label">
                Your Name:
                <input
                  type="text"
                  value={responseName}
                  onChange={(e) => setResponseName(e.target.value)}
                  required
                />
              </label>
              <label className="modal-label">
                To:
                <input
                  type="email"
                  value={selectedMessage.sender_email}
                  readOnly
                  disabled
                />
              </label>
              <label className="modal-label">
                Your Response:
                <textarea
                  className="message"
                  placeholder="Type your response here..."
                  value={responseMessage} // Folosește `responseMessage` pentru mesajul de răspuns
                  onChange={(e) => setResponseMessage(e.target.value)}
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
