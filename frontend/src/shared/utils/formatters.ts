import { LetterGrade } from '../../types';

export const GRADE_POINTS: Record<LetterGrade, number> = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0,
  'In Progress': 0.0,
};

/**
 * Calculates cumulative GPA based on enrolled courses and grades.
 */
export function calculateGPA(grades: { grade: LetterGrade; credits?: number }[]): number {
  let totalPoints = 0;
  let totalCredits = 0;

  grades.forEach(({ grade, credits = 3 }) => {
    if (grade !== 'In Progress' && GRADE_POINTS[grade] !== undefined) {
      totalPoints += GRADE_POINTS[grade] * credits;
      totalCredits += credits;
    }
  });

  return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0.0;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}
