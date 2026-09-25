import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap';

  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    outline: 'border border-neutral-300 text-neutral-700 bg-transparent',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs min-h-[32px]',
    md: 'px-4 py-2 text-xs min-h-[38px]',
    lg: 'px-5 py-2.5 text-sm min-h-[44px]',
  };

  const variantStyles = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-2xs',
    secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-200',
    outline: 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 shadow-2xs',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : null}
      {children}
    </button>
  );
};
