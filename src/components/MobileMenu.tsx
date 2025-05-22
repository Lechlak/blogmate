import React, { useState } from 'react';
import { Menu, X, PenLine, ListTodo, Search, Link, Settings } from 'lucide-react';

interface MobileMenuProps {
  activeMode: string;
  setActiveMode: (mode: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ activeMode, setActiveMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'title', label: 'Title Mode', icon: <PenLine size={20} /> },
    { id: 'write', label: 'Write Mode', icon: <ListTodo size={20} /> },
    { id: 'research', label: 'Research Mode', icon: <Search size={20} /> },
    { id: 'url', label: 'URL Mode', icon: <Link size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleMenuClick = (mode: string) => {
    setActiveMode(mode);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <PenLine className="text-indigo-600" /> BlogGenius
              </h1>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm ${
                        activeMode === item.id
                          ? 'bg-indigo-50 text-indigo-600 font-medium border-l-4 border-indigo-600'
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;