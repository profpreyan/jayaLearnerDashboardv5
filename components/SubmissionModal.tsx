import React, { useState } from 'react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
  taskTitle: string;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, onClose, onSubmit, taskTitle }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText('');
      onClose();
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h3 className="text-xl font-bold text-white">Submit Assignment</h3>
          <p className="text-sm text-gray-400 mt-1">For: <span className="text-accent">{taskTitle}</span></p>
        </div>

        <div className="p-6">
          <textarea
            className="w-full h-64 bg-black/50 border border-white/10 rounded-xl p-4 text-gray-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none font-mono text-sm"
            placeholder="Paste your work link, reflection, or code snippet here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="p-6 pt-2 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !text.trim()}
            className="px-8 py-2.5 rounded-lg text-sm font-bold bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSubmitting ? 'Sending...' : 'Confirm Submission'}
          </button>
        </div>
      </div>
    </div>
  );
};