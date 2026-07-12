'use client';

import { useState } from 'react';
import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { DataTable } from '@/components/templates/tables';
import { Eye, Download, Truck } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

const orders: Order[] = [
  { id: '#ORD-001', customer: 'John Doe', email: 'john@example.com', total: 299.99, status: 'delivered', date: '2024-01-15' },
  { id: '#ORD-002', customer: 'Jane Smith', email: 'jane@example.com', total: 499.99, status: 'shipped', date: '2024-02-20' },
  { id: '#ORD-003', customer: 'Bob Johnson', email: 'bob@example.com', total: 149.99, status: 'processing', date: '2024-03-10' },
  { id: '#ORD-004', customer: 'Alice Williams', email: 'alice@example.com', total: 799.99, status: 'pending', date: '2024-04-05' },
  { id: '#ORD-005', customer: 'Charlie Brown', email: 'charlie@example.com', total: 89.99, status: 'cancelled', date: '2024-05-12' },
  { id: '#ORD-006', customer: 'Diana Prince', email: 'diana@example.com', total: 399.99, status: 'delivered', date: '2024-06-18' },
  { id: '#ORD-007', customer: 'Eve Davis', email: 'eve@example.com', total: 259.99, status: 'shipped', date: '2024-07-22' },
  { id: '#ORD-008', customer: 'Frank Miller', email: 'frank@example.com', total: 129.99, status: 'processing', date: '2024-08-30' },
];

export default function OrdersTablePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusConfig = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Shipped' },
    delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono font-semibold text-indigo-600">{value}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (value: string, row: Order) => (
        <div>
          <div className="font-semibold">{value}</div>
          <div className="text-xs text-neutral-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (value: number) => (
        <span className="font-bold text-neutral-900">${value.toFixed(2)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const config = statusConfig[value as keyof typeof statusConfig];
        return (
          <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const renderActions = (row: Order) => (
    <div className="flex items-center gap-1">
      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="View details">
        <Eye className="w-4 h-4 text-neutral-600" />
      </button>
      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Track shipment">
        <Truck className="w-4 h-4 text-neutral-600" />
      </button>
      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" title="Download invoice">
        <Download className="w-4 h-4 text-neutral-600" />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Orders Table
            </h1>
            <p className="text-neutral-600">
              Order history with status tracking and customer details.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={paginatedOrders}
            searchable
            searchPlaceholder="Search orders..."
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
