'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showInfoAlert,
  showConfirmDialog,
  showDeleteConfirm,
  showLoadingAlert,
  showToastSuccess,
  showToastError,
  showToastInfo,
} from '@/components/advanced';

/**
 * Alerts & Notifications Demo
 * Showcasing SweetAlert2 and React Hot Toast
 */

export default function AlertsDemoPage() {
  const handleLoadingDemo = async () => {
    showLoadingAlert('Processing', 'Please wait...');
    setTimeout(() => {
      showSuccessAlert('Success!', 'Operation completed successfully');
    }, 2000);
  };

  const handleConfirmDemo = async () => {
    const result = await showConfirmDialog(
      'Confirm Action',
      'Are you sure you want to proceed with this action?'
    );
    if (result.isConfirmed) {
      showToastSuccess('Action confirmed!');
    }
  };

  const handleDeleteDemo = async () => {
    const result = await showDeleteConfirm('User Account');
    if (result.isConfirmed) {
      showToastSuccess('Item deleted successfully');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-5xl mx-auto">
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
            Alerts & Notifications
          </h1>
          <p className="text-lg text-neutral-600">
            Beautiful alert modals with SweetAlert2 and toast notifications with React Hot Toast
          </p>
        </motion.div>

        {/* SweetAlert2 Demos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-4">SweetAlert2 Modals</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => showSuccessAlert('Success!', 'Your operation completed successfully')}
              className="h-12 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
            >
              Success Alert
            </button>
            <button
              onClick={() => showErrorAlert('Error!', 'Something went wrong. Please try again.')}
              className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              Error Alert
            </button>
            <button
              onClick={() => showWarningAlert('Warning!', 'Please review your input before proceeding')}
              className="h-12 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors"
            >
              Warning Alert
            </button>
            <button
              onClick={() => showInfoAlert('Information', 'Here is some helpful information for you')}
              className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              Info Alert
            </button>
            <button
              onClick={handleConfirmDemo}
              className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
            >
              Confirm Dialog
            </button>
            <button
              onClick={handleDeleteDemo}
              className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              Delete Confirm
            </button>
            <button
              onClick={handleLoadingDemo}
              className="h-12 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors md:col-span-2"
            >
              Loading Alert (2s)
            </button>
          </div>
        </motion.div>

        {/* React Hot Toast Demos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm"
        >
          <h2 className="text-xl font-bold text-neutral-900 mb-4">React Hot Toast</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => toast.success('Successfully saved!')}
              className="h-12 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
            >
              Success Toast
            </button>
            <button
              onClick={() => toast.error('Failed to save changes')}
              className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              Error Toast
            </button>
            <button
              onClick={() => toast('Here is some information', { icon: 'ℹ️' })}
              className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              Info Toast
            </button>
            <button
              onClick={() => toast.loading('Loading...', { duration: 2000 })}
              className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
            >
              Loading Toast
            </button>
            <button
              onClick={() => toast('Custom message with emoji', { icon: '🚀' })}
              className="h-12 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors md:col-span-2"
            >
              Custom Toast
            </button>
          </div>
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm"
        >
          <h2 className="text-xl font-bold text-white mb-4">Usage Example</h2>
          <pre className="text-sm text-neutral-300 overflow-x-auto">
            <code>{`import { showSuccessAlert, showConfirmDialog } from '@/components/advanced';
import toast from 'react-hot-toast';

// SweetAlert2
showSuccessAlert('Success!', 'Operation completed');
showErrorAlert('Error!', 'Something went wrong');

const result = await showConfirmDialog('Confirm', 'Are you sure?');
if (result.isConfirmed) {
  // Handle confirmation
}

// React Hot Toast
toast.success('Successfully saved!');
toast.error('Failed to save');
toast.loading('Loading...');`}</code>
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
