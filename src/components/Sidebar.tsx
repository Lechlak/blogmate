import React from 'react';
import { PenLine, ListTodo, Search, Link, Settings } from 'lucide-react';

interface SidebarProps {
  activeMode: string;
  setActiveMode: (mode: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMode, setActiveMode }) => {
  const menuItems = [
    { id: 'title', label: 'Title Mode', icon: <PenLine size={20} /> },
    { id: 'write', label: 'Write Mode', icon: <ListTodo size={20} /> },
    { id: 'research', label: 'Research Mode', icon: <Search size={20} /> },
    { id: 'url', label: 'URL Mode', icon: <Link size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-md hidden md:flex flex-col z-10">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <PenLine className="text-indigo-600" /> BlogGenius
        </h1>
        <p className="text-sm text-gray-500 mt-1">AI-Powered Blog Assistant</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveMode(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm ${
                  activeMode === item.id
                    ? 'bg-indigo-50 text-indigo-600 font-medium border-r-4 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          © 2025 BlogGenius
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;