'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { AdvancedDataTable } from '@/components/advanced';
import { ColumnDef } from '@tanstack/react-table';

/**
 * Advanced Data Table Demo
 * Showcasing TanStack Table with sorting, filtering, pagination
 */

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
}

export default function DataTableDemoPage() {
  const [data] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      joinedDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Editor',
      status: 'active',
      joinedDate: '2024-02-20',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'Viewer',
      status: 'inactive',
      joinedDate: '2024-03-10',
    },
    {
      id: '4',
      name: 'Alice Williams',
      email: 'alice@example.com',
      role: 'Editor',
      status: 'active',
      joinedDate: '2024-01-25',
    },
    {
      id: '5',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: 'Viewer',
      status: 'pending',
      joinedDate: '2024-04-05',
    },
    {
      id: '6',
      name: 'Diana Prince',
      email: 'diana@example.com',
      role: 'Admin',
      status: 'active',
      joinedDate: '2023-12-01',
    },
    {
      id: '7',
      name: 'Ethan Hunt',
      email: 'ethan@example.com',
      role: 'Editor',
      status: 'active',
      joinedDate: '2024-02-14',
    },
    {
      id: '8',
      name: 'Fiona Gallagher',
      email: 'fiona@example.com',
      role: 'Viewer',
      status: 'inactive',
      joinedDate: '2024-03-22',
    },
    {
      id: '9',
      name: 'George Martin',
      email: 'george@example.com',
      role: 'Editor',
      status: 'pending',
      joinedDate: '2024-04-18',
    },
    {
      id: '10',
      name: 'Hannah Montana',
      email: 'hannah@example.com',
      role: 'Viewer',
      status: 'active',
      joinedDate: '2024-01-30',
    },
    {
      id: '11',
      name: 'Ian Malcolm',
      email: 'ian@example.com',
      role: 'Admin',
      status: 'active',
      joinedDate: '2023-11-15',
    },
    {
      id: '12',
      name: 'Julia Roberts',
      email: 'julia@example.com',
      role: 'Editor',
      status: 'active',
      joinedDate: '2024-02-28',
    },
  ]);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {row.original.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-neutral-900">{row.original.name}</div>
            <div className="text-sm text-neutral-500">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const colors = {
          Admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          Editor: 'bg-purple-100 text-purple-700 border-purple-200',
          Viewer: 'bg-neutral-100 text-neutral-700 border-neutral-200',
        };
        return (
          <span
            className={`px-3 py-1 rounded-lg text-xs font-bold border ${
              colors[row.original.role as keyof typeof colors]
            }`}
          >
            {row.original.role}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusConfig = {
          active: {
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-200',
            label: 'Active',
          },
          inactive: {
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-200',
            label: 'Inactive',
          },
          pending: {
            icon: Circle,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            label: 'Pending',
          },
        };
        const config = statusConfig[row.original.status];
        const Icon = config.icon;
        return (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border ${config.bg} ${config.border}`}
          >
            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            <span className={config.color}>{config.label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'joinedDate',
      header: 'Joined Date',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-600">
          {new Date(row.original.joinedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
  ];

  const handleExport = (exportData: User[]) => {
    console.log('Exporting data:', exportData);
    alert(`Exporting ${exportData.length} rows`);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-7xl mx-auto">
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
            Advanced Data Table
          </h1>
          <p className="text-lg text-neutral-600">
            Powerful data table with sorting, filtering, pagination, and row selection powered by TanStack Table
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200"
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600" />
              <span className="text-sm font-medium text-indigo-900">Global Search</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              <span className="text-sm font-medium text-purple-900">Column Sorting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-600" />
              <span className="text-sm font-medium text-pink-900">Pagination</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-sm font-medium text-blue-900">Row Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-600" />
              <span className="text-sm font-medium text-cyan-900">Export Data</span>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdvancedDataTable
            data={data}
            columns={columns}
            enableSorting
            enableFiltering
            enablePagination
            enableRowSelection
            enableExport
            pageSize={5}
            onExport={handleExport}
            onRowClick={(row) => {
              console.log('Row clicked:', row.original);
              alert(`Clicked: ${row.original.name}`);
            }}
          />
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm"
        >
          <h2 className="text-xl font-bold text-white mb-4">Usage Example</h2>
          <pre className="text-sm text-neutral-300 overflow-x-auto">
            <code>{`import { AdvancedDataTable } from '@/components/advanced';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
];

<AdvancedDataTable
  data={users}
  columns={columns}
  enableSorting
  enableFiltering
  enablePagination
  enableRowSelection
  enableExport
  pageSize={10}
  onRowClick={(row) => console.log(row.original)}
  onExport={(data) => exportToCSV(data)}
/>`}</code>
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
