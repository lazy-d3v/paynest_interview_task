import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: string;
  status: 'active' | 'ended';
}

export default function CountdownTimer({ endTime, status }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'urgent' | 'ended'>('normal');

  useEffect(() => {
    if (status === 'ended') {
      setTimeLeft('Ended');
      setUrgency('ended');
      return;
    }

    const update = () => {
      const now = Date.now();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Ended');
        setUrgency('ended');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }

      // Set urgency level
      const totalSeconds = diff / 1000;
      if (totalSeconds <= 30) {
        setUrgency('urgent');
      } else if (totalSeconds <= 120) {
        setUrgency('warning');
      } else {
        setUrgency('normal');
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime, status]);

  return (
    <div className={`countdown ${urgency}`}>
      🕐 {timeLeft}
    </div>
  );
}
