import React, { useState, useEffect } from 'react';

const StatsCounter = ({ value, label, icon, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = typeof value === 'number' ? value : parseFloat(value);
    const increment = end / (duration * 60);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
      <div className="text-3xl font-bold mb-2">
        {typeof value === 'number' ? count.toLocaleString() : count}{suffix}
      </div>
      <div className="flex items-center justify-center space-x-2 text-white/80">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
    </div>
  );
};

export default StatsCounter;