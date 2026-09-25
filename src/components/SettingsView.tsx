import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Database, 
  FileSpreadsheet, 
  Server, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Student, Course, Enrollment, AttendanceEntry, ActivityLog } from '../types';

interface SettingsViewProps {
  students?: Student[];
  courses?: Course[];
  enrollments?: Enrollment[];
  attendance?: AttendanceEntry[];
  logs?: ActivityLog[];
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  onImportJSON?: (data: any) => void;
  onResetData?: () => void;
  onImportStudents?: () => void;
  onExportData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  students = [],
  courses = [],
  enrollments = [],
  attendance = [],
  logs = [],
  onExportCSV,
  onExportJSON,
  onImportJSON,
  onResetData,
  onImportStudents,
  onExportData,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState('');

  const handleExportCSVClick = () => {
    if (onExportCSV) {
      onExportCSV();
    } else {
      // Default fallback CSV export
      const headers = ['Student ID', 'First Name', 'Last Name', 'Email', 'Major', 'Department', 'Year', 'GPA', 'Status'];
      const rows = students.map((s) => [
        s.studentId,
        s.firstName,
        s.lastName,
        s.email,
        s.major,
        s.department,
        s.year,
        s.gpa.toFixed(2),
        s.status,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.map(val => `"${val}"`).join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `students-roster-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportJSONClick = () => {
    if (onExportJSON) {
      onExportJSON();
    } else if (onExportData) {
      onExportData();
    }
  };

  const handleResetClick = () => {
    if (onResetData) onResetData();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.students && json.courses) {
          if (onImportJSON) {
            onImportJSON(json);
          } else if (onImportStudents) {
            onImportStudents();
          }
          setImportSuccess(true);
          setImportError('');
          setTimeout(() => setImportSuccess(false), 4000);
        } else {
          setImportError('Invalid backup file structure.');
        }
      } catch (err) {
        setImportError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* System Architecture Card */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
            <Server className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 text-base">Campus Student Management System (SMS)</h3>
            <p className="text-xs text-neutral-500">
              Modern Academic Administration & Information Portal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-100 text-xs">
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <p className="text-neutral-400 font-medium">Active Academic Term</p>
            <p className="font-bold text-neutral-900 mt-0.5">Fall Semester 2026</p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <p className="text-neutral-400 font-medium">Grading Standard</p>
            <p className="font-bold text-neutral-900 mt-0.5">4.00 Grade Point Scale (GPA)</p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <p className="text-neutral-400 font-medium">Data Storage Engine</p>
            <p className="font-bold text-neutral-900 mt-0.5">Persistent Local Client Engine</p>
          </div>
        </div>
      </div>

      {/* Data Backup & Export Section */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          Data Backup & Records Export
        </h3>
        <p className="text-xs text-neutral-500">
          Export full campus rosters or complete database snapshots for administrative archiving, spreadsheet analysis, or cross-system transfer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export CSV */}
          <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-neutral-900 text-xs mb-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Export Student Roster (CSV)
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                Download a clean, formatted CSV file containing student names, IDs, majors, GPAs, tuition, and advisor details.
              </p>
            </div>
            <button
              id="settings-export-csv-btn"
              onClick={handleExportCSVClick}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV File</span>
            </button>
          </div>

          {/* Export JSON */}
          <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-neutral-900 text-xs mb-1">
                <Database className="w-4 h-4 text-indigo-600" />
                System Snapshot Backup (JSON)
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                Export the complete relational database state including students, course catalog, enrollments, and attendance logs.
              </p>
            </div>
            <button
              id="settings-export-json-btn"
              onClick={handleExportJSONClick}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Restore Backup File */}
        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-neutral-800">Restore from Backup Snapshot</h4>
            <p className="text-xs text-neutral-500">Upload a previously exported JSON backup file.</p>
          </div>
          <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Select Backup File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {importSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Database successfully restored from backup snapshot!</span>
          </div>
        )}

        {importError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{importError}</span>
          </div>
        )}
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-rose-600 text-sm flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset Demo Data
        </h3>
        <p className="text-xs text-neutral-500">
          Reset student rosters, course offerings, enrollments, and attendance registers back to the default university seed data.
        </p>

        <div>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset to Factory Seed Data
            </button>
          ) : (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-3 max-w-md">
              <p className="text-xs text-rose-800 font-medium">
                Are you sure? This will replace any custom students or enrollments you have added with the original campus demo roster.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleResetClick();
                    setShowResetConfirm(false);
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Activity Logs Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-3.5 sm:p-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <h3 className="font-bold text-neutral-900 text-xs sm:text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-500" />
            Audit Trail & Transaction Logs
          </h3>
          <span className="text-[11px] sm:text-xs text-neutral-400">Last 50 system operations</span>
        </div>

        <div className="max-h-64 overflow-y-auto overflow-x-auto no-scrollbar sm:overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase text-[10px] sticky top-0">
              <tr>
                <th className="p-3 whitespace-nowrap min-w-[140px]">Timestamp</th>
                <th className="p-3 whitespace-nowrap min-w-[130px]">Operation</th>
                <th className="p-3 whitespace-nowrap min-w-[200px]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {(!logs || logs.length === 0) ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-neutral-400">No activity logged yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/70">
                    <td className="p-3 font-mono text-neutral-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="p-3 font-semibold text-neutral-900 whitespace-nowrap">{log.title}</td>
                    <td className="p-3 text-neutral-600">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
