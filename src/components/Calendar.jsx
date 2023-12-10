import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from  "react-datepicker";
import ko from 'date-fns/locale/ko';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.css';

registerLocale('ko', ko)

const Calendar = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState({});
    const [newEvent, setNewEvent] = useState('');
    const [editingEventId, setEditingEventId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const eventInput = useRef(null);

    // 현재 시간을 업데이트하는 함수
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    // 로컬스토리지에서 이벤트 로드
    useEffect(() => {
        const loadedEvents = localStorage.getItem('events');
        if (loadedEvents) {
            setEvents(JSON.parse(loadedEvents));
        }
    }, []);

    // 이벤트 상태가 변경될 때마다 로컬스토리지에 저장
    useEffect(() => {
        localStorage.setItem('events', JSON.stringify(events));
    }, [events]);
    
    const handleSelect = date => {
        if (selectedDate && date.getTime() === selectedDate.getTime()) {
            setSelectedDate(null);
        } else {
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            setSelectedDate(date);
        }
        setNewEvent('');
        setEditingEventId(null);
    }

    const handleAddEvent = () => {
        if (newEvent === '') {
            eventInput.current.focus();
        } else {
            const dateStr = selectedDate.toISOString().split('T')[0];
            setEvents({
                ...events,
                [dateStr]: [...(events[dateStr] || []), { id: Date.now(), content: newEvent, done: false }]
            });
            setNewEvent('');
            setEditingEventId(null);
        }
    }

    const handleDeleteEvent = (date, id) => {
        setEvents({
            ...events,
            [date]: events[date].filter(event => event.id !== id)
        });
    }

    const handleEditEvent = (date, id) => {
        setNewEvent(events[date].find(event => event.id === id).content);
        setEditingEventId(id);
    }

    const handleUpdateEvent = (date, id) => {
        setEvents({
            ...events,
            [date]: events[date].map(event => event.id === id ? { id, content: newEvent, done: event.done } : event)
        });
        setNewEvent('');
        setEditingEventId(null);
    }

    const handleToggleDone = (date, id) => {
        setEvents({
            ...events,
            [date]: events[date].map(event => event.id === id ? { ...event, done: !event.done } : event)
        });
    }

    // 특정 날짜에 이벤트가 있는지 확인하는 함수
const dateHasEvent = (date) => {
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    const dateStr = adjustedDate.toISOString().split('T')[0];
    
    return events[dateStr] && events[dateStr].length > 0;
}
    
    return (
        <div className="calendar-container">
        <div>
            <h2>현재 시간: {currentTime.toLocaleString()}..</h2>

            <DatePicker 
                selected={selectedDate} 
                onChange={date => {
                    date.setHours(0, 0, 0, 0);
                    handleSelect(date);
                }}
                dateFormat="yyyy/MM/dd"
                locale={ko}
                inline 
                dayClassName={date => dateHasEvent(date) ? "event-day" : undefined}
            />
        </div>

            {selectedDate && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (editingEventId) {
                        handleUpdateEvent(selectedDate.toISOString().split('T')[0], editingEventId);
                    } else {
                        handleAddEvent();
                    }
                }}>
                    <input
                        type="text"
                        value={newEvent}
                        onChange={e => setNewEvent(e.target.value)}
                        placeholder="일정을 입력하세요"
                        ref={eventInput}
                    />
                    <div>
                        <button type="submit">{editingEventId ? '수정 하기' : '일정 추가'}</button>
                    </div>
                </form>
            )}

            <div className="todo-list-container">
                {selectedDate && events[selectedDate.toISOString().split('T')[0]] && (
                    <div>
                        <p>{selectedDate.toISOString().split('T')[0]}</p>
                        {events[selectedDate.toISOString().split('T')[0]].map(event => (
                            <p key={event.id} className="event-item" style={{ textDecoration: event.done ? 'line-through' : 'none' }}>
                                - {event.content}
                                <button onClick={() => handleToggleDone(selectedDate.toISOString().split('T')[0], event.id)}>
                                    {event.done ? '취소' : '완료'}
                                </button>
                                <button onClick={() => handleEditEvent(selectedDate.toISOString().split('T')[0], event.id)}>수정</button>
                                <button onClick={() => handleDeleteEvent(selectedDate.toISOString().split('T')[0], event.id)}>삭제</button>
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;
