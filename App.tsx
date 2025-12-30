import React, { useState, useEffect } from 'react';
import { sheetService } from './services/sheetService';
import { SheetData, Task, TaskStatus } from './types';
import { ProgressBar } from './components/ProgressBar';
import { TaskCard } from './components/TaskCard';
import { SubmissionModal } from './components/SubmissionModal';
import { Login } from './components/Login';

const SESSION_KEY = 'redshift_session';
const SESSION_DURATION = 1.5 * 60 * 60 * 1000; // 1.5 hours in ms

const App: React.FC = () => {
  const [data, setData] = useState<SheetData | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Date Formatting
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const { name, passcode, expiry } = JSON.parse(savedSession);
          if (Date.now() < expiry) {
            // Valid session found, auto-login
            // We reuse handleLogin logic but we might not want to re-save the cookie or we might want to extend it.
            // For now, simply re-fetching the data.
            await handleLogin(name, passcode);
          } else {
            // Session expired
            localStorage.removeItem(SESSION_KEY);
          }
        } catch (e) {
          localStorage.removeItem(SESSION_KEY);
        }
      }
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  // Handle Login
  const handleLogin = async (name: string, passcode: string): Promise<boolean> => {
    try {
      const userData = await sheetService.login(name, passcode);
      if (userData) {
        setData(userData);
        setIsAuthenticated(true);
        
        // Save session
        const sessionData = {
          name,
          passcode,
          expiry: Date.now() + SESSION_DURATION
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleOpenSubmit = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (text: string) => {
    if (!selectedTask || !data) return;

    let optimisticStatus = TaskStatus.SUBMITTED;
    if (selectedTask.status === TaskStatus.SUBMITTED || 
        selectedTask.status === TaskStatus.RESUBMITTED || 
        selectedTask.status === TaskStatus.REDO) {
      optimisticStatus = TaskStatus.RESUBMITTED;
    }

    const updatedTasks = data.tasks.map(t => 
      t.id === selectedTask.id ? { ...t, status: optimisticStatus } : t
    );
    
    const completedCount = updatedTasks.filter(t => 
      t.status === TaskStatus.SUBMITTED || 
      t.status === TaskStatus.RESUBMITTED || 
      t.status === TaskStatus.CHECKED
    ).length;

    setData({
      ...data,
      tasks: updatedTasks,
      progress: {
        ...data.progress,
        weeklyTasksCompleted: completedCount
      }
    });

    try {
      // Updated to pass student name and task title for logging
      const confirmedStatus = await sheetService.submitTask(
        selectedTask.id, 
        text, 
        data.student.name, 
        selectedTask.title
      );

      if (confirmedStatus !== optimisticStatus) {
         const correctedTasks = data.tasks.map(t => 
            t.id === selectedTask.id ? { ...t, status: confirmedStatus } : t
         );
         setData(prev => prev ? ({...prev, tasks: correctedTasks}) : null);
      }
    } catch (e) {
      console.error("Submission failed, reverting optimistic update");
    }
  };

  // ------------------------------------------------------------------
  // RENDER: LOADING OR LOGIN
  // ------------------------------------------------------------------
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // ------------------------------------------------------------------
  // RENDER: DASHBOARD
  // ------------------------------------------------------------------
  if (!data) return <div className="text-white text-center mt-20">Error loading dashboard.</div>;

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] opacity-40"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-12">
        
        {/* HEADER SECTION */}
        <header className="mb-12 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="h-px w-8 bg-accent"></span>
                <span className="text-accent uppercase tracking-[0.2em] text-xs font-bold">Learner Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">{data.student.name}</span>
              </h1>
              <p className="text-gray-400 font-mono text-sm">{dateStr}</p>
            </div>
            
            <div className="text-right">
              <div className="inline-block bg-white/5 border border-white/10 px-6 py-3 rounded-xl backdrop-blur-md">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current Focus</p>
                <p className="text-xl font-bold text-white max-w-xs">{data.currentTopic}</p>
              </div>
            </div>
          </div>

          {/* PROGRESS DASHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-5 rounded-xl">
              <ProgressBar 
                label={`Week ${data.progress.week}`} 
                value={data.progress.weeklyTasksCompleted} 
                max={data.progress.totalWeeklyTasks} 
                subLabel={`${data.progress.weeklyTasksCompleted}/${data.progress.totalWeeklyTasks} Tasks`}
              />
            </div>
            <div className="glass-panel p-5 rounded-xl">
              <ProgressBar 
                label={`Month ${data.progress.month}`} 
                value={data.progress.week % 4 === 0 ? 4 : data.progress.week % 4} 
                max={4}
                subLabel="Monthly Goals"
              />
            </div>
            <div className="glass-panel p-5 rounded-xl">
              <ProgressBar 
                label="Course Completion" 
                value={data.progress.week} 
                max={data.progress.totalWeeks} 
                subLabel={`${Math.round((data.progress.week / data.progress.totalWeeks) * 100)}%`}
                size="sm"
              />
            </div>
          </div>
        </header>

        {/* TASKS LIST */}
        <main className="space-y-2">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Weekly Tasks
            </h2>
            <span className="text-xs text-gray-500 uppercase tracking-wider border border-white/10 px-3 py-1 rounded-full">
              Week {data.progress.week} of {data.progress.totalWeeks}
            </span>
          </div>

          <div className="space-y-4">
            {data.tasks.map((task, index) => (
               <div 
                 key={task.id} 
                 className="animate-slide-up"
                 style={{ animationDelay: `${index * 100}ms` }}
               >
                 <TaskCard task={task} onOpenSubmit={handleOpenSubmit} />
               </div>
            ))}
          </div>
        </main>
      </div>

      <SubmissionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTask}
        taskTitle={selectedTask?.title || ''}
      />
    </div>
  );
};

export default App;