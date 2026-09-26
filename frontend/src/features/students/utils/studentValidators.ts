import { Student } from '../../../types';

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
}

export function validateStudentForm(data: Partial<Student>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.firstName || !data.firstName.trim()) {
    errors.firstName = 'First name is required.';
  }

  if (!data.lastName || !data.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please provide a valid university email address.';
  }

  if (!data.department || !data.department.trim()) {
    errors.department = 'Department is required.';
  }

  return errors;
}
