import React, { useState } from 'react';
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

const DraggableEvent = ({ id, content, duration, color, onClick, hour }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.EVENT,
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const eventDurationInPixels = duration * 50; // Adjust height based on the duration (50px per hour)

  return (
    <div
      ref={drag}
      className="event"
      style={{
        opacity: isDragging ? 0.5 : 1,
        height: `${eventDurationInPixels}px`,
        backgroundColor: color,
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

  const moveEvent = (id, newDay, newHour) => {
    setEvents((prevEvents) => ({
      ...prevEvents,
      [id]: { ...prevEvents[id], day: newDay, hour: newHour },
    }));
  };

  const addEvent = () => {
    const newId = `event-${Object.keys(events).length + 1}`;
    setEvents((prevEvents) => ({
      ...prevEvents,
      [newId]: newEvent,
    }));
    resetEventForm();
  };

  const editEvent = (id) => {
    setEditingEvent(id);
    setNewEvent(events[id]);
    setModalVisible(true);
  };

  const updateEvent = () => {
    setEvents((prevEvents) => ({
      ...prevEvents,
      [editingEvent]: newEvent,
    }));
    resetEventForm();
  };

  const deleteEvent = (id) => {
    setEvents((prevEvents) => {
      const { [id]: _, ...rest } = prevEvents;
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
    editEvent(id);
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
