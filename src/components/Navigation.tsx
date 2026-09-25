import React from 'react';
import { 
  Users, 
  BookOpen, 
  CalendarCheck, 
  BarChart3, 
  Settings2 
} from 'lucide-react';
import { ViewTab } from '../types';

interface NavigationProps {
  activeTab: ViewTab;
  onSelectTab?: (tab: ViewTab) => void;
  onTabChange?: (tab: ViewTab) => void;
  studentsCount?: number;
  studentCount?: number;
  coursesCount?: number;
  courseCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onTabChange,
  studentsCount,
  studentCount,
  coursesCount,
  courseCount,
}) => {
  const handleTabSelect = (tab: ViewTab) => {
    if (onTabChange) onTabChange(tab);
    else if (onSelectTab) onSelectTab(tab);
  };

  const totalStudents = studentsCount !== undefined ? studentsCount : (studentCount ?? 0);
  const totalCourses = coursesCount !== undefined ? coursesCount : (courseCount ?? 0);

  const navItems = [
    {
      id: 'students' as ViewTab,
      label: 'Students Roster',
      shortLabel: 'Students',
      icon: Users,
      badge: totalStudents,
    },
    {
      id: 'courses' as ViewTab,
      label: 'Courses & Catalog',
      shortLabel: 'Courses',
      icon: BookOpen,
      badge: totalCourses,
    },
    {
      id: 'attendance' as ViewTab,
      label: 'Attendance Register',
      shortLabel: 'Attendance',
      icon: CalendarCheck,
    },
    {
      id: 'analytics' as ViewTab,
      label: 'Academic Analytics',
      shortLabel: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings' as ViewTab,
      label: 'System & Data',
      shortLabel: 'Settings',
      icon: Settings2,
    },
  ];

  return (
    <nav id="app-navigation" className="bg-white border-b border-neutral-200/80 sticky top-14 sm:top-16 z-20 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar py-1.5 sm:py-2 -mx-1 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => handleTabSelect(item.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[40px] ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-neutral-500'}`} />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-0.5 sm:ml-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                      isActive
                        ? 'bg-neutral-800 text-neutral-200'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

