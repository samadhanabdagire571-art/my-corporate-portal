import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export const ChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-5 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-blue-400/30"
          title="Open Corporate AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-blue-600 animate-pulse"></span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
            AI Assistant
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          </span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
