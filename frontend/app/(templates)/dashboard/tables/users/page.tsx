'use client';

import { useState } from 'react';
import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { DataTable } from '@/components/templates/tables';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, Mail } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', joinedAt: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'active', joinedAt: '2024-02-20' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'inactive', joinedAt: '2024-03-10' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Editor', status: 'active', joinedAt: '2024-04-05' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer', status: 'pending', joinedAt: '2024-05-12' },
  { id: 6, name: 'Diana Prince', email: 'diana@example.com', role: 'Admin', status: 'active', joinedAt: '2024-06-18' },
  { id: 7, name: 'Eve Davis', email: 'eve@example.com', role: 'Editor', status: 'active', joinedAt: '2024-07-22' },
  { id: 8, name: 'Frank Miller', email: 'frank@example.com', role: 'Viewer', status: 'inactive', joinedAt: '2024-08-30' },
];

export default function UsersTablePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value: string, row: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {value.charAt(0)}
          </div>
          <div>
            <div className="font-semibold">{value}</div>
            <div className="text-xs text-neutral-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value: string) => (
        <span className="px-3 py-1 text-xs font-semibold bg-neutral-100 text-neutral-700 rounded-lg">
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-lg ${
            value === 'active'
              ? 'bg-green-100 text-green-700'
              : value === 'inactive'
              ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'joinedAt',
      label: 'Joined',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const renderActions = (row: User) => (
    <div className="flex items-center gap-1">
      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
        <Edit className="w-4 h-4 text-neutral-600" />
      </button>
      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
        <Mail className="w-4 h-4 text-neutral-600" />
      </button>
      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Users Table
            </h1>
            <p className="text-neutral-600">
              Complete user management table with sorting, search, and actions.
            </p>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={paginatedUsers}
            searchable
            searchPlaceholder="Search users..."
            filterable
            exportable
            selectable
            actions={renderActions}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </main>
    </div>
  );
}
