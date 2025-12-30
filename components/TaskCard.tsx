import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { StatusTag } from './StatusTag';

interface TaskCardProps {
  task: Task;
  onOpenSubmit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onOpenSubmit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isLocked = task.status === TaskStatus.LOCKED;

  const toggleExpand = () => {
    if (!isLocked) {
      setIsExpanded(!isExpanded);
    }
  };

  // Helper icons
  const LinkIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
  );

  const BookIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  );

  const ChevronIcon = ({ className }: { className?: string }) => (
    <svg className={`w-5 h-5 transition-transform duration-300 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
  );

  const LockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  return (
    <div className={`group w-full mb-4 ${isLocked ? 'opacity-60 grayscale' : ''}`}>
      {/* Card Container */}
      <div 
        className={`glass-panel rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-neutral-900/80 border-white/20' : isLocked ? 'border-transparent bg-white/5' : 'hover:border-white/20'}`}
      >
        {/* Header (Clickable if not locked) */}
        <div 
          onClick={toggleExpand}
          className={`p-5 flex items-center justify-between select-none ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border transition-colors duration-300 
              ${task.status === TaskStatus.CHECKED ? 'bg-green-500/10 border-green-500/50 text-green-500' : 
                task.status === TaskStatus.REDO ? 'bg-accent/10 border-accent/50 text-accent' : 
                isLocked ? 'bg-neutral-800 border-neutral-700 text-neutral-500' :
                'bg-white/5 border-white/10 text-gray-400'}`}>
              
              {isLocked ? (
                <LockIcon />
              ) : (
                <span className="font-mono text-sm font-bold">{task.id.toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold transition-all duration-300 truncate
                ${isLocked ? 'text-gray-500 blur-[4px]' : isExpanded ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                {task.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-6 pl-4">
             {/* Hidden on mobile for cleaner look */}
            <div className="hidden md:block">
              <StatusTag status={task.status} />
            </div>
            <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-white/10 rotate-180' : isLocked ? 'text-neutral-600' : 'bg-transparent text-gray-500 group-hover:text-white'}`}>
              {!isLocked && <ChevronIcon />}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        <div 
          className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {/* Removed pt-0 to ensure proper spacing between the border and content */}
          <div className="p-6 border-t border-white/5 flex flex-col md:flex-row gap-8">
            
            {/* Left Column: Details */}
            <div className="flex-1 space-y-6">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Description</h4>
                <p className="text-gray-300 leading-relaxed text-sm">{task.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {task.referenceLinks.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-2">
                      <LinkIcon /> Reference Links
                    </h4>
                    <ul className="space-y-2">
                      {task.referenceLinks.map((link, i) => (
                        <li key={i}>
                          <a href={link} target="_blank" rel="noreferrer" className="text-sm text-accent hover:text-white transition-colors underline decoration-accent/30 underline-offset-4 hover:decoration-white truncate block">
                            {link.replace(/^https?:\/\//, '')}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {task.learningMaterials.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-2">
                      <BookIcon /> Learning Materials
                    </h4>
                    <ul className="space-y-2">
                      {task.learningMaterials.map((mat, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0" />
                          {mat}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Action */}
            <div className="w-full md:w-64 shrink-0 flex flex-col justify-end border-l border-white/5 pl-0 md:pl-8 pt-6 md:pt-0">
               <div className="md:hidden mb-4">
                 <StatusTag status={task.status} />
               </div>
               
               <p className="text-xs text-gray-500 mb-4 text-center md:text-left">
                 {task.status === TaskStatus.CHECKED 
                   ? "This task has been verified by your educator."
                   : task.status === TaskStatus.SUBMITTED
                   ? "Waiting for review. You can update your submission."
                   : "Ready for submission?"}
               </p>

               {task.status !== TaskStatus.CHECKED && (
                 <button 
                  onClick={(e) => { e.stopPropagation(); onOpenSubmit(task); }}
                  className={`w-full py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 
                    ${task.status === TaskStatus.SUBMITTED 
                      ? 'bg-transparent border border-white/20 text-gray-300 hover:bg-white/5 hover:text-white' 
                      : 'bg-accent text-white shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]'
                    }`}
                 >
                   {task.status === TaskStatus.SUBMITTED ? 'Resubmit' : 'Submit Assignment'}
                 </button>
               )}
               
               {task.status === TaskStatus.CHECKED && (
                 <div className="w-full py-3 px-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                   <span className="text-green-500 font-bold text-sm uppercase tracking-wider">Completed</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};