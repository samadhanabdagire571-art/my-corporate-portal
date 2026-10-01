import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatButton } from '../chat/ChatButton';

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-navy-50 overflow-hidden font-sans text-navy-900 antialiased">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-navy-50">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
            <Outlet />
          </div>
        </main>

        {/* Global AI Corporate Work Assistant Widget */}
        <ChatButton />
      </div>
    </div>
  );
};
