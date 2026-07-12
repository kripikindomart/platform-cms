'use client';

import { useState } from 'react';
import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { DataTable } from '@/components/templates/tables';
import { Eye, Edit, Trash2, Package } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

const products: Product[] = [
  { id: 1, name: 'Wireless Headphones', sku: 'WH-1000XM5', category: 'Electronics', price: 299.99, stock: 45, status: 'in-stock' },
  { id: 2, name: 'Smart Watch Pro', sku: 'SW-PRO-2024', category: 'Electronics', price: 399.99, stock: 12, status: 'low-stock' },
  { id: 3, name: 'Leather Wallet', sku: 'LW-CLASSIC', category: 'Accessories', price: 49.99, stock: 0, status: 'out-of-stock' },
  { id: 4, name: 'Running Shoes', sku: 'RS-ULTRA', category: 'Footwear', price: 129.99, stock: 78, status: 'in-stock' },
  { id: 5, name: 'Backpack Pro', sku: 'BP-PRO-V2', category: 'Bags', price: 89.99, stock: 34, status: 'in-stock' },
  { id: 6, name: 'Bluetooth Speaker', sku: 'BS-MINI', category: 'Electronics', price: 79.99, stock: 8, status: 'low-stock' },
  { id: 7, name: 'Sunglasses', sku: 'SG-CLASSIC', category: 'Accessories', price: 149.99, stock: 56, status: 'in-stock' },
  { id: 8, name: 'Desk Lamp', sku: 'DL-LED-2024', category: 'Home', price: 59.99, stock: 23, status: 'in-stock' },
];

export default function ProductsTablePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value: string, row: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-neutral-200 flex items-center justify-center">
            <Package className="w-6 h-6 text-neutral-400" />
          </div>
          <div>
            <div className="font-semibold">{value}</div>
            <div className="text-xs text-neutral-500">{row.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value: string) => (
        <span className="px-3 py-1 text-xs font-semibold bg-neutral-100 text-neutral-700 rounded-lg">
          {value}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-neutral-900">${value.toFixed(2)}</span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (value: number, row: Product) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{value}</span>
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded ${
              row.status === 'in-stock'
                ? 'bg-green-100 text-green-700'
                : row.status === 'low-stock'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {row.status === 'in-stock' ? 'In Stock' : row.status === 'low-stock' ? 'Low' : 'Out'}
          </span>
        </div>
      ),
    },
  ];

  const renderActions = (row: Product) => (
    <div className="flex items-center gap-1">
      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
        <Eye className="w-4 h-4 text-neutral-600" />
      </button>
      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
        <Edit className="w-4 h-4 text-neutral-600" />
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Products Table
            </h1>
            <p className="text-neutral-600">
              Product catalog with images, pricing, and stock management.
            </p>
          </div>

          <DataTable
            columns={columns}
            data={paginatedProducts}
            searchable
            searchPlaceholder="Search products..."
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
