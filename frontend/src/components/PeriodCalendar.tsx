import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CalendarDay {
  date: number;
  fullDate: Date | null;
  isPeriod: boolean;
  isOvulation: boolean;
  isPredicted: boolean;
  isToday: boolean;
}

interface PeriodCalendarProps {
  nextPeriod?: string; // From FastAPI: "YYYY-MM-DD"
}

const PeriodCalendar: React.FC<PeriodCalendarProps> = ({ nextPeriod }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (viewDate: Date): CalendarDay[] => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days: CalendarDay[] = [];
    
    // Predicted date logic from Props
    const predictedDate = nextPeriod ? new Date(nextPeriod) : null;
    
    // Add empty cells for padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ date: 0, fullDate: null, isPeriod: false, isOvulation: false, isPredicted: false, isToday: false });
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      
      // Check if this date matches the predicted next period
      // We'll highlight the predicted start date + the next 4 days (average period length)
      let isPredicted = false;
      if (predictedDate) {
        const diffTime = currentDate.getTime() - predictedDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isPredicted = diffDays >= 0 && diffDays < 5; 
      }

      const isToday = 
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();
      
      days.push({
        date: day,
        fullDate: currentDate,
        isPeriod: false, // You can link this to historical data later
        isOvulation: false, // Calculated on backend
        isPredicted,
        isToday,
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(direction === 'prev' ? prev.getMonth() - 1 : prev.getMonth() + 1);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentMonth);

  const getDayClassName = (day: CalendarDay) => {
    if (day.date === 0) return 'invisible';
    
    let base = 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-300 ';
    
    if (day.isToday) base += 'ring-2 ring-primary border-2 border-white ';
    
    if (day.isPredicted) {
      base += 'bg-primary/20 text-primary border-2 border-primary border-dashed ';
    } else if (day.isOvulation) {
      base += 'bg-amber-400 text-white ';
    } else {
      base += 'hover:bg-gray-100 text-gray-700 ';
    }
    
    return base;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
           <h2 className="font-poppins font-bold text-2xl text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          {nextPeriod && currentMonth.getMonth() === new Date(nextPeriod).getMonth() && (
            <span className="text-xs text-primary font-medium">Predicted period this month</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button onClick={() => navigateMonth('prev')} className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100">
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button onClick={() => navigateMonth('next')} className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100">
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
          <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-3 justify-items-center">
        {days.map((day, idx) => (
          <motion.div 
            key={idx} 
            whileHover={day.date !== 0 ? { scale: 1.1 } : {}}
            className={getDayClassName(day)}
          >
            {day.date !== 0 && day.date}
          </motion.div>
        ))}
      </div>

      {/* Instructional Image & Legend */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/20 border border-primary border-dashed rounded-full"></div>
              <span className="text-xs text-gray-500">Predicted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 ring-2 ring-primary rounded-full"></div>
              <span className="text-xs text-gray-500">Today</span>
            </div>
          </div>
        </div>
        
        



        <p className="text-[10px] text-gray-400 mt-4 leading-relaxed uppercase tracking-tighter">
          * Predictions are based on your 28-day average and are for informational purposes only.
        </p>
      </div>
    </div>
  );
};

export default PeriodCalendar;