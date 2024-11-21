import React, { useState } from 'react';
import './Notification.css';

const Notification = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    isVisible && (
      <div className="notification">
        <span>{message}</span>
        <button className="close-btn" onClick={handleClose}>×</button>
      </div>
    )
  );
};

export default Notification;
