import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'h-12 w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-neutral-900 transition-all outline-none',
            'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
            'hover:border-neutral-300',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = 'Select';

// Custom Select with React (more control)
interface CustomSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CustomSelect = React.forwardRef<HTMLDivElement, CustomSelectProps>(
  ({ value, onValueChange, options, placeholder, className, disabled }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState(value || '');

    const selectedOption = options.find((opt) => opt.value === selected);

    const handleSelect = (optionValue: string) => {
      setSelected(optionValue);
      onValueChange?.(optionValue);
      setOpen(false);
    };

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref]);

    return (
      <div ref={ref} className={cn('relative', className)}>
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={cn(
            'h-12 w-full flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-all outline-none',
            'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
            'hover:border-neutral-300',
            open && 'border-indigo-500 ring-4 ring-indigo-500/20'
          )}
        >
          <span className={cn(!selectedOption && 'text-neutral-500')}>
            {selectedOption?.label || placeholder || 'Select...'}
          </span>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-neutral-400 transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto p-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    'hover:bg-neutral-50',
                    option.value === selected
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-neutral-900'
                  )}
                >
                  <div className="flex-1 text-left">
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {option.value === selected && (
                    <Check className="h-4 w-4 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
CustomSelect.displayName = 'CustomSelect';

export { Select, CustomSelect };
