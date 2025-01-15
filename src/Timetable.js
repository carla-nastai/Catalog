import React, { useState, useEffect } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Timetable.css';
import './App.css';

const ItemTypes = {
  EVENT: 'event',
};

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hours = [
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
  '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'
];

const DraggableEvent = ({ id, content, duration, color, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EVENT,
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const eventDurationInPixels = duration * 50; // Ajustăm înălțimea bazată pe durata (50px pe oră)

  return (
    <div
      ref={drag}
      className="event"
      style={{
        opacity: isDragging ? 0.5 : 1,
        height: `${eventDurationInPixels}px`,
        lineHeight: `${eventDurationInPixels}px`, // Centrare pe verticală
        backgroundColor: color,
        position: 'absolute', // Evenimentul trebuie să aibă poziție absolută în cadrul celulei
        top: 0, // Începe din partea superioară
        left: 0, // Începe din partea stângă
        width: '100%', // Ocupă întreaga lățime a celulei
      }}
      onClick={() => onClick(id)}
    >
      {content}
    </div>
  );
};


const DroppableCell = ({ children, onDrop, onClick }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.EVENT,
    drop: (item) => onDrop(item.id),
  }));

  return (
    <div ref={drop} className="cell" onClick={onClick}>
      {children}
    </div>
  );
};

const saveTableState = async (events) => {
  const userEmail = localStorage.getItem('email'); // Email-ul utilizatorului din localStorage

  if (!userEmail) {
    console.error('User email not found in localStorage');
    return;
  }

  try {
    await fetch('http://localhost:5000/api/table-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_email: userEmail, table_state: events }),
    });
  } catch (error) {
    console.error('Error saving table state:', error);
  }
};

const loadTableState = async () => {
  const userEmail = localStorage.getItem('email'); // Email-ul utilizatorului din localStorage

  if (!userEmail) {
    console.error('User email not found in localStorage');
    return {};
  }

  try {
    const response = await fetch(`http://localhost:5000/api/table-state?user_email=${userEmail}`);
    if (response.ok) {
      const data = await response.json();
      return data || {};
    } else {
      console.error('Error loading table state');
      return {};
    }
  } catch (error) {
    console.error('Error loading table state:', error);
    return {};
  }
};

const Timetable = () => {
  const [events, setEvents] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    content: '',
    day: '',
    hour: 0,
    place: '',
    duration: 1,
    color: '#2196F3',
  });

  // Încarcă starea tabelului la montarea componentei
  useEffect(() => {
    const fetchTableState = async () => {
      const loadedEvents = await loadTableState();
      setEvents(loadedEvents);
    };
    fetchTableState();
  }, []);

  const moveEvent = (id, newDay, newHour) => {
    setEvents((prevEvents) => {
      const updatedEvents = {
        ...prevEvents,
        [id]: { ...prevEvents[id], day: newDay, hour: newHour },
      };
      saveTableState(updatedEvents); // Salvează modificarea
      return updatedEvents;
    });
  };

  const addEvent = () => {
    const newId = `event-${Object.keys(events).length + 1}`;
    setEvents((prevEvents) => {
      const updatedEvents = {
        ...prevEvents,
        [newId]: newEvent,
      };
      saveTableState(updatedEvents); // Salvează adăugarea
      return updatedEvents;
    });
    resetEventForm();
  };

  const updateEvent = () => {
    setEvents((prevEvents) => {
      const updatedEvents = {
        ...prevEvents,
        [editingEvent]: newEvent,
      };
      saveTableState(updatedEvents); // Salvează actualizarea
      return updatedEvents;
    });
    resetEventForm();
  };

  const deleteEvent = (id) => {
    setEvents((prevEvents) => {
      const { [id]: _, ...rest } = prevEvents;
      saveTableState(rest); // Salvează ștergerea
      return rest;
    });
    resetEventForm();
  };

  const resetEventForm = () => {
    setNewEvent({
      content: '',
      day: '',
      hour: 0,
      place: '',
      duration: 1,
      color: '#2196F3',
    });
    setEditingEvent(null);
    setModalVisible(false);
  };

  const handleCellClick = (day, hour) => {
    setNewEvent({ ...newEvent, day, hour });
    setModalVisible(true);
  };

  const handleEventClick = (id) => {
    setEditingEvent(id); // Setează ID-ul evenimentului care urmează să fie editat
    setNewEvent(events[id]); // Populează formularul cu datele evenimentului selectat
    setModalVisible(true); // Deschide modalul de editare
  };
  

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="timetable-container">
        {modalVisible && (
          <div className="modal">
            <div className="modal-content">
              <h3>{editingEvent ? 'Edit Event' : 'Add Event'}</h3>
              <input
                type="text"
                value={newEvent.content}
                onChange={(e) => setNewEvent({ ...newEvent, content: e.target.value })}
                placeholder="Event content"
              />
              <input
                type="text"
                value={newEvent.place}
                onChange={(e) => setNewEvent({ ...newEvent, place: e.target.value })}
                placeholder="Event place"
              />
              <input
                type="number"
                value={newEvent.duration}
                onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value, 10) })}
                placeholder="Duration (hours)"
              />
              <input
                type="color"
                value={newEvent.color}
                onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                placeholder="Color"
              />
              <div className="modal-buttons">
                {editingEvent ? (
                  <>
                    <button onClick={updateEvent}>Update Event</button>
                    <button onClick={() => deleteEvent(editingEvent)}>Delete Event</button>
                  </>
                ) : (
                  <button onClick={addEvent}>Add Event</button>
                )}
                <button onClick={resetEventForm}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        <div className="timetable">
          <div className="header-table">
            <div className="header-cell"></div>
            {days.map((day) => (
              <div className="header-cell" key={day}>{day}</div>
            ))}
          </div>
          <div className="body">
            {hours.map((hour, index) => (
              <div className="row" key={hour} style={{ height: '50px' }}>
                <div className="hour-cell">{hour}</div>
                {days.map((day) => (
                  <DroppableCell
                    key={day}
                    onDrop={(id) => moveEvent(id, day, index)}
                    onClick={() => handleCellClick(day, index)}
                  >
                    {Object.entries(events).map(([id, event]) => (
                      event.day === day && event.hour === index && (
                        <DraggableEvent
                          key={id}
                          id={id}
                          content={`${event.content} (${event.place}, ${event.duration}h)`}
                          duration={event.duration}
                          color={event.color}
                          hour={index}
                          onClick={handleEventClick}
                        />
                      )
                    ))}
                  </DroppableCell>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default Timetable;
