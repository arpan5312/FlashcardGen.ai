import React from 'react';
import { Upload, Library, Brain, FolderOpen, LogOut } from 'lucide-react';
import { useAuth } from './context/AuthContext'; 

interface NavigationProps {
  currentView: 'upload' | 'library' | 'review' | 'categories';
  onViewChange: (view: 'upload' | 'library' | 'review' | 'categories') => void;
  reviewCount: number;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, reviewCount }) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'review', label: 'Review', icon: Brain, badge: reviewCount > 0 ? reviewCount : undefined },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
  ] as const;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Branding */}
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-500" />
            <h1 className="text-xl font-bold text-gray-900">FlashcardGen</h1>
          </div>

          {/* Center Nav Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Logout Button */}
          <div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
