import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: RadioOption[];
  name: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    { value, onValueChange, options, name, className, orientation = 'vertical' },
    ref
  ) => {
    const [selected, setSelected] = React.useState(value || '');

    React.useEffect(() => {
      if (value) setSelected(value);
    }, [value]);

    const handleChange = (optionValue: string) => {
      setSelected(optionValue);
      onValueChange?.(optionValue);
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          'space-y-3',
          orientation === 'horizontal' && 'flex gap-4 space-y-0',
          className
        )}
      >
        {options.map((option) => {
          const isChecked = selected === option.value;
          const isDisabled = option.disabled;

          return (
            <label
              key={option.value}
              className={cn(
                'relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer',
                isChecked
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isChecked}
                onChange={() => !isDisabled && handleChange(option.value)}
                disabled={isDisabled}
                className="sr-only"
              />

              {/* Custom Radio */}
              <div className="flex items-center justify-center mt-0.5">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 transition-all',
                    isChecked
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-neutral-300 bg-white'
                  )}
                >
                  {isChecked && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Label & Description */}
              <div className="flex-1">
                <div
                  className={cn(
                    'text-sm font-semibold transition-colors',
                    isChecked ? 'text-indigo-900' : 'text-neutral-900'
                  )}
                >
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-sm text-neutral-500 mt-0.5">
                    {option.description}
                  </div>
                )}
              </div>

              {/* Check indicator */}
              {isChecked && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </label>
          );
        })}
      </div>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';

export { RadioGroup };
