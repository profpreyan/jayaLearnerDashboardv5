import React from 'react';
import { TaskStatus } from '../types';

interface StatusTagProps {
  status: TaskStatus;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  let styles = "";
  
  switch (status) {
    case TaskStatus.LIVE:
      styles = "bg-white/10 text-white border-white/20 animate-pulse";
      break;
    case TaskStatus.SUBMITTED:
      styles = "bg-blue-500/20 text-blue-400 border-blue-500/30";
      break;
    case TaskStatus.RESUBMITTED:
      styles = "bg-purple-500/20 text-purple-400 border-purple-500/30";
      break;
    case TaskStatus.REDO:
      styles = "bg-accent/20 text-accent border-accent/40 shadow-[0_0_10px_rgba(220,38,38,0.2)]";
      break;
    case TaskStatus.CHECKED:
      styles = "bg-green-500/20 text-green-400 border-green-500/30";
      break;
    case TaskStatus.LOCKED:
      // Matches the "Live" tag structure (glassy) but without pulse and with gray text
      styles = "bg-white/5 text-gray-500 border-white/10";
      break;
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border backdrop-blur-md ${styles}`}>
      {status}
    </span>
  );
};