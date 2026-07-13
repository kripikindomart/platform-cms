'use client';

import { useState } from 'react';
import Select, { StylesConfig, GroupBase } from 'react-select';

/**
 * SearchSelect - Advanced searchable dropdown using react-select
 * Features: search, multi-select, async loading, custom styling
 */

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface SearchSelectProps {
  options: SelectOption[];
  value?: SelectOption | readonly SelectOption[] | null;
  onChange: (value: SelectOption | readonly SelectOption[] | null) => void;
  placeholder?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  className?: string;
}

const customStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '48px',
    borderRadius: '12px',
    borderColor: state.isFocused ? '#6366f1' : '#e5e5e5',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
    '&:hover': {
      borderColor: '#6366f1',
    },
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e5e5',
    overflow: 'hidden',
    marginTop: '4px',
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '4px',
  }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? '#6366f1'
      : state.isFocused
      ? '#f5f3ff'
      : 'transparent',
    color: state.isSelected ? '#ffffff' : '#171717',
    fontWeight: state.isSelected ? '600' : '500',
    fontSize: '14px',
    '&:active': {
      backgroundColor: '#6366f1',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    borderRadius: '8px',
    backgroundColor: '#eef2ff',
    border: '1px solid #c7d2fe',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#4338ca',
    fontWeight: '500',
    fontSize: '14px',
    padding: '4px 8px',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#6366f1',
    borderRadius: '0 6px 6px 0',
    '&:hover': {
      backgroundColor: '#c7d2fe',
      color: '#4338ca',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '400',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#171717',
    fontSize: '14px',
    fontWeight: '500',
  }),
  input: (provided) => ({
    ...provided,
    color: '#171717',
    fontSize: '14px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#6366f1' : '#9ca3af',
    '&:hover': {
      color: '#6366f1',
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: '#9ca3af',
    '&:hover': {
      color: '#ef4444',
    },
  }),
  loadingIndicator: (provided) => ({
    ...provided,
    color: '#6366f1',
  }),
};

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  isMulti = false,
  isSearchable = true,
  isDisabled = false,
  isLoading = false,
  isClearable = true,
  className = '',
}: SearchSelectProps) {
  return (
    <div className={className}>
      <Select
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isMulti={isMulti}
        isSearchable={isSearchable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        styles={customStyles}
        classNamePrefix="react-select"
      />
    </div>
  );
}

// Async SearchSelect for loading options dynamically
interface AsyncSearchSelectProps extends Omit<SearchSelectProps, 'options' | 'onChange'> {
  loadOptions: (inputValue: string) => Promise<SelectOption[]>;
  onChange: (value: SelectOption | readonly SelectOption[] | null) => void;
}

export function AsyncSearchSelect({
  loadOptions,
  value,
  onChange,
  placeholder = 'Search...',
  isMulti = false,
  isDisabled = false,
  isClearable = true,
  className = '',
}: AsyncSearchSelectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>([]);

  const handleInputChange = async (inputValue: string) => {
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await loadOptions(inputValue);
      setOptions(results);
    } catch (error) {
      console.error('Error loading options:', error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Select
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isMulti={isMulti}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        onInputChange={handleInputChange}
        styles={customStyles}
        classNamePrefix="react-select"
        noOptionsMessage={({ inputValue }) =>
          inputValue.length < 2
            ? 'Type at least 2 characters to search'
            : 'No options found'
        }
      />
    </div>
  );
}
