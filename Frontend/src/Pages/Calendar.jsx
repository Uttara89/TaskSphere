import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useUserContext } from '../context/UserContext';
import backgroundImage from '../assets/image.png';

const Calendar = () => {
  const [deadlines, setDeadlines] = useState([]); // State to store deadlines
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected date
  const [currentMonth, setCurrentMonth] = useState(new Date()); // State for current month view
  
  // Get the actual user ID from context instead of hardcoded value
  const { userId, isUserSynced } = useUserContext();

  // Fetch deadlines on component mount
  useEffect(() => {
    const fetchDeadlines = async () => {
      // Wait for user to be synced before fetching deadlines
      if (!userId || !isUserSynced) {
        console.log('Waiting for user sync before fetching deadlines...');
        return;
      }

      try {
        console.log('Fetching deadlines for userId:', userId);
  const response = await api.get(`/tasksphere/user/${userId}/deadlines`);
        console.log('Deadlines response:', response.data);
        setDeadlines(response.data.deadlines); // Set the fetched deadlines in state
      } catch (error) {
        console.error('Error fetching deadlines:', error);
        setDeadlines([]);
      }
    };

    fetchDeadlines();
  }, [userId, isUserSynced]);

  // Helper function to get days in a month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  // Helper function to check if a date has deadlines
  const getDeadlinesForDate = (day) => {
    if (!day) return [];
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return deadlines
      .filter(d => !d.completed)
      .filter(deadline => {
        const deadlineDate = new Date(deadline.deadline);
        return deadlineDate.toDateString() === currentDate.toDateString();
      });
  };

  // Helper function to format month/year
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  return (
    <>
      <div className="bg-gray-200 rounded-3xl p-2">
        <div className="flex justify-center font-bold text-3xl m-2">Calendar</div>

        {!userId && (
          <div className="flex justify-center m-4 text-gray-600">
            Loading user information...
          </div>
        )}

        {userId && (
          <>
            <div 
              className="w-[100%] rounded-2xl p-4 mb-4 relative"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Light overlay for readability */}
              <div className="absolute inset-0 bg-white/60 rounded-2xl"></div>
              
              {/* Content container */}
              <div className="relative z-10">
              <h1 className="flex justify-center font-bold border-b-2 border-b-cyan-400 mb-2">Upcoming Deadlines</h1>
              <div className="flex justify-center overflow-y-scroll h-56">
                <ul className="w-full">
                  {deadlines.filter(d => !d.completed).length > 0 ? (
                    deadlines.filter(d => !d.completed).map((deadline, index) => {
                      const deadlineDate = new Date(deadline.deadline);
                      const today = new Date();
                      const timeDiff = deadlineDate - today;
                      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                      
                      let urgencyClass = '';
                      let urgencyText = '';
                      
                      if (daysDiff < 0) {
                        urgencyClass = 'bg-red-100 border-red-300 text-red-700';
                        urgencyText = 'Overdue';
                      } else if (daysDiff === 0) {
                        urgencyClass = 'bg-orange-100 border-orange-300 text-orange-700';
                        urgencyText = 'Due Today';
                      } else if (daysDiff <= 3) {
                        urgencyClass = 'bg-yellow-100 border-yellow-300 text-yellow-700';
                        urgencyText = `Due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
                      } else {
                        urgencyClass = 'bg-green-100 border-green-300 text-green-700';
                        urgencyText = `Due in ${daysDiff} days`;
                      }

                      return (
                        <li key={index} className="p-3 rounded-lg mb-2 bg-white/80">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold">{deadline.title}</p>
                              <p className="text-sm">Deadline: {deadlineDate.toLocaleDateString()}</p>
                            </div>
                            <div className="text-xs font-medium">
                              {urgencyText}
                            </div>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500">No deadlines found.</p>
                  )}
                </ul>
              </div>
              </div>
            </div>

            <div className="bg-blue-100 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={goToPreviousMonth}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  ‹ Previous
                </button>
                <h2 className="text-xl font-bold">{formatMonthYear(currentMonth)}</h2>
                <button 
                  onClick={goToNextMonth}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Next ›
                </button>
              </div>
              
              <button 
                onClick={goToToday}
                className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Today
              </button>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-bold p-2 bg-blue-200 rounded">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, index) => {
                  const dayDeadlines = getDeadlinesForDate(day);
                  const hasDeadlines = dayDeadlines.length > 0;
                  const isToday = day && 
                    new Date().toDateString() === 
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

                  return (
                    <div 
                      key={index} 
                      className={`
                        min-h-[60px] p-1 border rounded text-center cursor-pointer
                        ${day ? 'bg-white hover:bg-blue-50' : 'bg-gray-100'}
                        ${isToday ? 'bg-yellow-200 border-yellow-400' : 'border-gray-200'}
                        ${hasDeadlines ? 'border-red-400 bg-red-50' : ''}
                      `}
                      onClick={() => day && setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                    >
                      {day && (
                        <>
                          <div className={`font-medium ${isToday ? 'text-blue-800' : ''}`}>
                            {day}
                          </div>
                          {hasDeadlines && (
                            <div className="mt-1">
                              {dayDeadlines.map((deadline, idx) => (
                                <div 
                                  key={idx} 
                                  className="text-xs bg-red-500 text-white rounded px-1 mb-1 truncate"
                                  title={deadline.title}
                                >
                                  {deadline.title.length > 8 ? deadline.title.substring(0, 8) + '...' : deadline.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedDate && (
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <h3 className="font-bold mb-2">
                    Selected Date: {selectedDate.toLocaleDateString()}
                  </h3>
      {getDeadlinesForDate(selectedDate.getDate()).filter(d => !d.completed).length > 0 ? (
                    <div>
                      <p className="font-medium mb-2">Tasks due on this date:</p>
                      <ul className="space-y-1">
        {getDeadlinesForDate(selectedDate.getDate()).filter(d => !d.completed).map((deadline, idx) => (
                          <li key={idx} className="text-sm bg-gray-100 p-2 rounded">
                            {deadline.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No tasks due on this date.</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Calendar;