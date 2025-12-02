'use client';

import { useState, useEffect } from 'react';

export default function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return { hours, minutes, seconds };
  };

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${dayName}, ${monthName} ${day}, ${year}`;
  };

  const { hours, minutes, seconds } = formatTime(time);
  const dateString = formatDate(time);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Digital Clock */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-6 mb-4 border border-white/20">
        <div className="flex items-center gap-2">
          <div className="text-6xl font-bold text-white tabular-nums">
            {hours}
          </div>
          <div className="text-6xl font-bold text-white/70 tabular-nums">:</div>
          <div className="text-6xl font-bold text-white tabular-nums">
            {minutes}
          </div>
          <div className="text-6xl font-bold text-white/70 tabular-nums">:</div>
          <div className="text-4xl font-bold text-white/80 tabular-nums">
            {seconds}
          </div>
        </div>
      </div>
      
      {/* Date */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
        <p className="text-xl font-medium text-white text-center">
          {dateString}
        </p>
      </div>
    </div>
  );
}

