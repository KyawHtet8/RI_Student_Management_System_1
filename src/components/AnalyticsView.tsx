import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Award, 
  Users, 
  CreditCard, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { Student, Course, Enrollment } from '../types';
import { DEPARTMENTS } from '../data/mockData';

interface AnalyticsViewProps {
  students?: Student[];
  courses?: Course[];
  enrollments?: Enrollment[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  students = [],
  courses = [],
  enrollments = [],
}) => {
  const studentList = Array.isArray(students) ? students : [];
  // Metrics calculation
  const totalStudents = studentList.length;
  const activeStudents = studentList.filter((s) => s.status === 'Active').length;
  const activeRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

  const avgGPA = totalStudents > 0
    ? (studentList.reduce((acc, s) => acc + (s.gpa || 0), 0) / totalStudents).toFixed(2)
    : '0.00';

  const honorsStudents = studentList.filter((s) => (s.gpa || 0) >= 3.75);
  const honorsRate = totalStudents > 0 ? Math.round((honorsStudents.length / totalStudents) * 100) : 0;

  const warningStudents = studentList.filter((s) => (s.gpa || 0) < 2.5);

  const paidCount = studentList.filter((s) => s.tuitionStatus === 'Paid').length;
  const tuitionCollectionRate = totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0;

  // GPA Distribution brackets
  const gpaBuckets = useMemo(() => {
    const b1 = studentList.filter((s) => (s.gpa || 0) >= 3.75).length;
    const b2 = studentList.filter((s) => (s.gpa || 0) >= 3.5 && (s.gpa || 0) < 3.75).length;
    const b3 = studentList.filter((s) => (s.gpa || 0) >= 3.0 && (s.gpa || 0) < 3.5).length;
    const b4 = studentList.filter((s) => (s.gpa || 0) >= 2.5 && (s.gpa || 0) < 3.0).length;
    const b5 = studentList.filter((s) => (s.gpa || 0) < 2.5).length;

    return [
      { label: '3.75 – 4.00 (Dean’s Honors)', count: b1, color: 'bg-indigo-600' },
      { label: '3.50 – 3.74 (Distinction)', count: b2, color: 'bg-blue-600' },
      { label: '3.00 – 3.49 (Good Standing)', count: b3, color: 'bg-emerald-600' },
      { label: '2.50 – 2.99 (Satisfactory)', count: b4, color: 'bg-amber-500' },
      { label: '< 2.50 (Academic Warning)', count: b5, color: 'bg-rose-500' },
    ];
  }, [students]);

  // Department distribution with student counts & average GPA
  const departmentStats = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      const deptStudents = studentList.filter((s) => s.department === dept);
      const count = deptStudents.length;
      const deptAvgGPA = count > 0
        ? (deptStudents.reduce((acc, s) => acc + (s.gpa || 0), 0) / count).toFixed(2)
        : '0.00';
      return {
        dept,
        count,
        avgGPA: deptAvgGPA,
        percent: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
      };
    }).sort((a, b) => b.count - a.count);
  }, [studentList, totalStudents]);

  // Academic Year Distribution
  const yearStats = useMemo(() => {
    const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'] as const;
    return years.map((y) => {
      const count = studentList.filter((s) => s.year === y).length;
      return {
        year: y,
        count,
        percent: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
      };
    });
  }, [studentList, totalStudents]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Active Students</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{activeStudents}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activeRate}% retention rate</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Campus Mean GPA</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{avgGPA}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500 font-medium">
            <span>4.00 Grade scale standard</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Dean's List Scholars</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{honorsStudents.length}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-600 font-medium">
            <span>{honorsRate}% of total student body</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Tuition Settlement</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{tuitionCollectionRate}%</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500 font-medium">
            <span>{paidCount} accounts fully settled</span>
          </div>
        </div>
      </div>

      {/* GPA Distribution & Academic Standing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GPA Distribution */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900 text-sm">GPA Distribution</h3>
            <span className="text-xs text-neutral-500 font-medium">Grading System</span>
          </div>

          <div className="space-y-4">
            {gpaBuckets.map((bucket, idx) => {
              const pct = totalStudents > 0 ? Math.round((bucket.count / totalStudents) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-700">{bucket.label}</span>
                    <span className="text-neutral-900 font-bold">
                      {bucket.count} students ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${bucket.color}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {warningStudents.length > 0 && (
            <div className="mt-5 p-3 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center gap-2.5 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>{warningStudents.length} students</strong> currently have a GPA below 2.50 and are flagged for academic advising review.
              </span>
            </div>
          )}
        </div>

        {/* Academic Year Demographics */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900 text-sm">Enrollment by Academic Standing Year</h3>
            <span className="text-xs text-neutral-500 font-medium">Cohort Headcount</span>
          </div>

          <div className="space-y-3.5">
            {yearStats.map((item) => (
              <div key={item.year} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  <span className="font-semibold text-neutral-800">{item.year}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28 bg-neutral-200 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-neutral-900 font-mono w-16 text-right">
                    {item.count} ({item.percent}%)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Academic Honors Spotlight */}
          <div className="mt-5 pt-4 border-t border-neutral-100">
            <h4 className="text-xs font-bold text-neutral-900 mb-2 flex items-center gap-1.5 text-amber-700">
              <Award className="w-3.5 h-3.5" /> Dean's List Top Scholars (GPA ≥ 3.90)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {students
                .filter((s) => s.gpa >= 3.9)
                .slice(0, 6)
                .map((scholar) => (
                  <span
                    key={scholar.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/80"
                  >
                    <span>{scholar.firstName} {scholar.lastName}</span>
                    <span className="font-mono text-[10px] text-amber-700">({scholar.gpa.toFixed(2)})</span>
                  </span>
                ))}
            </div>
          </div>
        </div>

      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-3.5 sm:p-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
          <h3 className="font-bold text-neutral-900 text-xs sm:text-sm">Departmental Roster & Academic Metrics</h3>
          <span className="text-[11px] sm:text-xs text-neutral-500 font-medium">8 Academic Divisions</span>
        </div>

        <div className="overflow-x-auto no-scrollbar sm:overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-neutral-50 text-neutral-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3 sm:p-3.5 whitespace-nowrap min-w-[160px]">Academic Department</th>
                <th className="p-3 sm:p-3.5 whitespace-nowrap min-w-[110px]">Enrolled Headcount</th>
                <th className="p-3 sm:p-3.5 whitespace-nowrap min-w-[130px]">Share of Student Body</th>
                <th className="p-3 sm:p-3.5 whitespace-nowrap min-w-[100px]">Department Mean GPA</th>
                <th className="p-3 sm:p-3.5 text-right whitespace-nowrap min-w-[80px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {departmentStats.map((dept) => (
                <tr key={dept.dept} className="hover:bg-neutral-50/70">
                  <td className="p-3 sm:p-3.5 font-bold text-neutral-900 whitespace-nowrap">{dept.dept}</td>
                  <td className="p-3 sm:p-3.5 font-semibold text-neutral-700 whitespace-nowrap">{dept.count} students</td>
                  <td className="p-3 sm:p-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 sm:w-20 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${dept.percent}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-neutral-500">{dept.percent}%</span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-3.5 font-bold font-mono text-neutral-800 whitespace-nowrap">{dept.avgGPA}</td>
                  <td className="p-3 sm:p-3.5 text-right whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
