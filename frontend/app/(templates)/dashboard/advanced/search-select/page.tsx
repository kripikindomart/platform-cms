'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, User, Globe, Tag } from 'lucide-react';
import { SearchSelect, AsyncSearchSelect, SelectOption } from '@/components/advanced';

/**
 * Search Select Demo
 * Showcasing React Select with premium styling
 */

export default function SearchSelectDemoPage() {
  // Single select
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(null);
  
  // Multi select
  const [selectedTags, setSelectedTags] = useState<readonly SelectOption[]>([]);
  
  // Async select
  const [selectedUser, setSelectedUser] = useState<SelectOption | null>(null);

  const countries: SelectOption[] = [
    { value: 'id', label: 'Indonesia' },
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'sg', label: 'Singapore' },
    { value: 'my', label: 'Malaysia' },
    { value: 'th', label: 'Thailand' },
    { value: 'vn', label: 'Vietnam' },
    { value: 'ph', label: 'Philippines' },
  ];

  const tags: SelectOption[] = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'react', label: 'React' },
    { value: 'nextjs', label: 'Next.js' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'tailwind', label: 'Tailwind CSS' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'redis', label: 'Redis' },
  ];

  // Simulate async loading
  const loadUsers = async (query: string): Promise<SelectOption[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = [
      { value: '1', label: 'John Doe' },
      { value: '2', label: 'Jane Smith' },
      { value: '3', label: 'Bob Johnson' },
      { value: '4', label: 'Alice Williams' },
      { value: '5', label: 'Charlie Brown' },
    ];

    return users.filter(user => 
      user.label.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link
          href="/dashboard/advanced"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Advanced
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">
            Search Select
          </h1>
          <p className="text-lg text-neutral-600">
            Advanced searchable dropdown powered by React Select with premium styling
          </p>
        </motion.div>

        {/* Single Select */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Single Select</h2>
              <p className="text-sm text-neutral-600">Choose one option from the list</p>
            </div>
          </div>

          <SearchSelect
            options={countries}
            value={selectedCountry}
            onChange={(value) => setSelectedCountry(value as SelectOption | null)}
            placeholder="Select a country..."
            isSearchable
            isClearable
          />

          {selectedCountry && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <p className="text-sm font-medium text-indigo-900">
                Selected: <span className="font-bold">{selectedCountry.label}</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Multi Select */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Multi Select</h2>
              <p className="text-sm text-neutral-600">Choose multiple options</p>
            </div>
          </div>

          <SearchSelect
            options={tags}
            value={selectedTags}
            onChange={(value) => setSelectedTags(value as readonly SelectOption[])}
            placeholder="Select technologies..."
            isMulti
            isSearchable
            isClearable
          />

          {selectedTags.length > 0 && (
            <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-sm font-medium text-purple-900 mb-2">
                Selected ({selectedTags.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.value}
                    className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-lg"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Async Select */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Async Search</h2>
              <p className="text-sm text-neutral-600">Search and load options dynamically</p>
            </div>
          </div>

          <AsyncSearchSelect
            loadOptions={loadUsers}
            value={selectedUser}
            onChange={(value) => setSelectedUser(value as SelectOption | null)}
            placeholder="Type to search users..."
            isClearable
          />

          {selectedUser && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Selected User: <span className="font-bold">{selectedUser.label}</span>
              </p>
            </div>
          )}

          <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <p className="text-xs text-neutral-600">
              💡 <strong>Tip:</strong> Type at least 2 characters to search. Results load after 500ms delay.
            </p>
          </div>
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm"
        >
          <h2 className="text-xl font-bold text-white mb-4">Usage Example</h2>
          <pre className="text-sm text-neutral-300 overflow-x-auto">
            <code>{`import { SearchSelect, AsyncSearchSelect } from '@/components/advanced';

// Single select
<SearchSelect
  options={countries}
  value={selected}
  onChange={setSelected}
  placeholder="Select..."
  isSearchable
  isClearable
/>

// Multi select
<SearchSelect
  options={tags}
  value={selectedTags}
  onChange={setSelectedTags}
  isMulti
  placeholder="Select multiple..."
/>

// Async search
<AsyncSearchSelect
  loadOptions={async (query) => {
    const results = await fetchOptions(query);
    return results;
  }}
  value={selected}
  onChange={setSelected}
  placeholder="Search..."
/>`}</code>
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
