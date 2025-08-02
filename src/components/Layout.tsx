import React from 'react';
import { Users, BookOpen, MessageSquare, FileText, Settings, LogOut, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'classes', label: 'Classes', icon: BookOpen },
    { id: 'groups', label: 'Groupes', icon: Users },
    { id: 'tasks', label: 'Tâches', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">EduClass Pro</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {user?.role === 'professor' ? 'Professeur' : 'Étudiant'}
          </span>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                  currentPage === item.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700' : 'text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;