import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Calendar, 
  History, 
  Bell, 
  Download,
  X
} from 'lucide-react';
import { Student, ActivityLog } from '../types';

interface HeaderProps {
  studentsCount?: number;
  onOpenAddModal?: () => void;
  logs?: ActivityLog[];
  onExportCSV?: () => void;
  globalSearch?: string;
  onSearchChange?: (val: string) => void;
  activeTerm?: string;
  onTermChange?: (term: string) => void;
  searchQuery?: string;
  onEnrollClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  studentsCount = 0,
  onOpenAddModal,
  logs = [],
  onExportCSV,
  globalSearch,
  searchQuery,
  onSearchChange,
  activeTerm = 'Fall Semester 2026',
  onTermChange,
  onEnrollClick,
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const currentSearch = globalSearch !== undefined ? globalSearch : (searchQuery || '');
  const handleSearchChange = (val: string) => {
    if (onSearchChange) onSearchChange(val);
  };
  const handleEnroll = () => {
    if (onEnrollClick) onEnrollClick();
    else if (onOpenAddModal) onOpenAddModal();
  };

  return (
    <header id="app-header" className="bg-white border-b border-neutral-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & System Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-max">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold tracking-tight text-neutral-900 text-base sm:text-lg">NextSMS</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Campus v2.6
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-500 font-medium hidden md:block">
                University Student Information System
              </p>
            </div>
          </div>

          {/* Quick Search Bar (Desktop) */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                value={currentSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search student ID, name, email or major..."
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
              {currentSearch && (
                <button 
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2.5">
            {/* Mobile Search Toggle Button */}
            <button
              id="header-mobile-search-toggle"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              aria-label="Toggle mobile search"
              className={`p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg md:hidden transition-colors cursor-pointer ${
                showMobileSearch || currentSearch ? 'bg-indigo-50 text-indigo-700' : ''
              }`}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Term Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-lg text-xs font-medium text-neutral-700">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>{activeTerm || 'Fall 2026 Term'}</span>
            </div>

            {/* Export CSV Quick Button */}
            {onExportCSV && (
              <button
                id="header-export-btn"
                onClick={onExportCSV}
                title="Export roster to CSV"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden md:inline">Export CSV</span>
                <span className="md:hidden">CSV</span>
              </button>
            )}

            {/* Activity Logs Notification Toggle */}
            <div className="relative">
              <button
                id="header-logs-btn"
                onClick={() => setShowLogs(!showLogs)}
                title="System Activity Logs"
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg relative transition-colors cursor-pointer"
                aria-label="View activity logs"
              >
                <History className="w-4 h-4" />
                {(logs?.length || 0) > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
                )}
              </button>

              {/* Logs Popover (Mobile Responsive) */}
              {showLogs && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-neutral-900/20 sm:hidden" 
                    onClick={() => setShowLogs(false)} 
                  />
                  <div 
                    id="header-logs-popover"
                    className="fixed inset-x-3 top-16 sm:top-auto sm:inset-auto sm:right-0 sm:mt-2 sm:w-96 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-sm font-semibold text-neutral-900">Audit & Activity Log</h4>
                      </div>
                      <button 
                        onClick={() => setShowLogs(false)}
                        className="p-1 text-neutral-400 hover:text-neutral-600 rounded-md"
                        aria-label="Close activity log"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100 py-1">
                      {(!logs || logs.length === 0) ? (
                        <p className="text-xs text-neutral-500 text-center py-4">No recent activity.</p>
                      ) : (
                        logs.slice(0, 10).map((log) => (
                          <div key={log.id} className="py-2 text-xs">
                            <div className="flex items-center justify-between text-neutral-500 text-[11px] mb-0.5">
                              <span className="font-semibold text-neutral-800">{log.title}</span>
                              <span>{log.timestamp}</span>
                            </div>
                            <p className="text-neutral-600">{log.details}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Add Student Primary Action */}
            <button
              id="header-add-student-btn"
              onClick={handleEnroll}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-950 text-white rounded-lg text-xs font-semibold transition-all shadow-xs hover:shadow cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enroll Student</span>
              <span className="sm:hidden">Enroll</span>
            </button>

          </div>
        </div>

        {/* Expandable Mobile Search Drawer */}
        {showMobileSearch && (
          <div className="py-2.5 border-t border-neutral-100 md:hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="global-mobile-search-input"
                type="text"
                value={currentSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search student ID, name, email or major..."
                autoFocus
                className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:bg-white focus:border-indigo-500"
              />
              {currentSearch && (
                <button 
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

