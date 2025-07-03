
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Briefcase, School, Users, Calendar, BookOpen, MessageSquare, Trophy, Search, User } from 'lucide-react';

const navItems = [
  { name: 'Search', path: '/search', icon: Search },
  { name: 'Schools', path: '/schools', icon: School },
  { name: 'Majors', path: '/majors', icon: GraduationCap },
  { name: 'Careers', path: '/careers', icon: Briefcase },
  { name: 'Mentors', path: '/mentors', icon: Users },
  { name: 'Opportunities', path: '/opportunities', icon: Trophy },
  { name: 'Scholarships', path: '/scholarships', icon: BookOpen },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'Hubs', path: '/hubs', icon: MessageSquare },
  { name: 'Profile', path: '/profile', icon: User },
];

export function ModernNavigation() {
  const location = useLocation();

  return (
    <nav className="flex items-center space-x-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'text-primary bg-primary/10 shadow-sm' 
                : 'text-gray-600 hover:text-primary hover:bg-gray-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
