import React from 'react';
import { Bot, User, ShieldCheck, FileText, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { ChatMessage } from '../../types';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'USER';

  // Format basic bold and bullets in message content
  const formatContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Bold rendering
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-navy-950">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="italic text-navy-800">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-navy-800 leading-relaxed">
            {formattedParts}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="ml-2 font-medium text-sm text-navy-900 mt-1">
            {formattedParts}
          </div>
        );
      }

      return (
        <p key={idx} className="text-sm leading-relaxed min-h-[1rem]">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-xs space-y-2 ${
        isUser
          ? 'bg-blue-600 text-white rounded-br-xs'
          : 'bg-white border border-navy-100 text-navy-900 rounded-bl-xs'
      }`}>
        <div className="space-y-1.5">
          {formatContent(message.content)}
        </div>

        {/* Source References (RAG) */}
        {!isUser && message.sourceReferences && message.sourceReferences.length > 0 && (
          <div className="pt-2 border-t border-navy-100 mt-2 space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-navy-500 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Verified Company Sources:
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {message.sourceReferences.map((src, sIdx) => (
                <span
                  key={sIdx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/60 text-[11px] font-medium text-blue-800"
                >
                  <FileText className="w-3 h-3 text-blue-600" />
                  {src.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-[10px] text-right font-mono ${isUser ? 'text-blue-200' : 'text-navy-400'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
