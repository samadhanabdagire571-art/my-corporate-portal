import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Plus,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../lib/api-client';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage, Conversation } from '../../types';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [quickQuestions, setQuickQuestions] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      loadQuickQuestions();
      if (messages.length === 0) {
        initWelcomeMessage();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const initWelcomeMessage = () => {
    const roleTitle = user?.role === 'ADMIN' ? 'Executive Administrator' : user?.role === 'TEAM_LEADER' ? 'Team Leader' : 'Staff Member';
    const welcome: ChatMessage = {
      id: 'welcome-msg',
      conversationId: 'default',
      role: 'ASSISTANT',
      content: `Hello **${user?.name || 'there'}**! I am your **Corporate Work Assistant** for ${roleTitle} operations.\n\nI can retrieve real-time data about your assigned tasks, team workload, project roadmaps, LMS training progress, and official company policies.\n\nSelect a quick prompt below or type any question to begin:`,
      createdAt: new Date().toISOString(),
    };
    setMessages([welcome]);
  };

  const loadQuickQuestions = async () => {
    try {
      const res = await api.get<{ quickQuestions: string[] }>('/api/v1/chat/quick-questions');
      if (res && res.quickQuestions) {
        setQuickQuestions(res.quickQuestions);
      }
    } catch {
      // Fallback quick questions by role
      if (user?.role === 'ADMIN') {
        setQuickQuestions([
          'What is the organization workload?',
          'How many active projects exist?',
          'What is the company leave policy?',
          'Show overdue tasks across organization',
        ]);
      } else if (user?.role === 'TEAM_LEADER') {
        setQuickQuestions([
          'Which employees have high workload?',
          'Show pending reviews for my team',
          'Which tasks are overdue in my team?',
          'What is our project progress?',
        ]);
      } else {
        setQuickQuestions([
          'What are my tasks today?',
          'What is my next deadline?',
          'What is my training progress?',
          'What is the company leave policy?',
        ]);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    setInputValue('');

    // Add user message to UI state immediately
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      conversationId: activeConversationId || 'conv-1',
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await api.post<{
        conversationId: string;
        message: string;
        intent: string;
        sourceReferences: any[];
      }>('/api/v1/chat', {
        message: text,
        conversationId: activeConversationId || undefined,
      });

      if (response.conversationId) {
        setActiveConversationId(response.conversationId);
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        conversationId: response.conversationId || 'conv-1',
        role: 'ASSISTANT',
        content: response.message,
        intent: response.intent,
        sourceReferences: response.sourceReferences,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Assistant service is temporarily unavailable. You can still use the portal normally.');
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        conversationId: activeConversationId || 'conv-1',
        role: 'ASSISTANT',
        content: '⚠️ The assistant is temporarily unavailable. You can still use the portal normally.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setErrorMsg(null);
    initWelcomeMessage();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[440px] h-[640px] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-navy-200/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Top Header */}
      <div className="bg-navy-900 text-white px-5 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-inner">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm tracking-tight text-white">Corporate Work Assistant</h3>
              <span className="flex items-center gap-1 text-[10px] font-medium bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                RBAC Active
              </span>
            </div>
            <p className="text-[11px] text-navy-300">Live Enterprise Data & Policies</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={startNewChat}
            title="Start New Conversation"
            className="p-1.5 text-navy-300 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close Assistant"
            className="p-1.5 text-navy-300 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-navy-50/50">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-in fade-in duration-100">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-navy-100 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-xs text-navy-500 ml-1.5 font-medium">Retrieving authorized data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Role Quick Questions Chips */}
      {quickQuestions.length > 0 && (
        <div className="p-2.5 bg-white border-t border-navy-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-navy-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 pl-1">
            <Sparkles className="w-3 h-3 text-blue-600" /> Prompts:
          </span>
          {quickQuestions.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 px-2.5 py-1 rounded-full whitespace-nowrap border border-blue-200/60 transition-colors flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-navy-100">
        {errorMsg && (
          <div className="mb-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about tasks, workload, policies, LMS..."
            disabled={isLoading}
            className="flex-1 bg-navy-50 border border-navy-200 rounded-xl px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
