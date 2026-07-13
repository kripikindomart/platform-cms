'use client';

import Swal from 'sweetalert2';

/**
 * SweetAlert2 Wrapper - Premium Alert Dialogs
 * Provides consistent styled alerts across the application
 */

// Success Alert
export const showSuccessAlert = (title: string, message?: string) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#6366f1',
    background: '#ffffff',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-neutral-200',
      title: 'text-2xl font-bold text-neutral-900',
      htmlContainer: 'text-neutral-600',
      confirmButton: 'rounded-xl px-6 py-3 font-semibold shadow-lg',
    },
  });
};

// Error Alert
export const showErrorAlert = (title: string, message?: string) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
    background: '#ffffff',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-neutral-200',
      title: 'text-2xl font-bold text-neutral-900',
      htmlContainer: 'text-neutral-600',
      confirmButton: 'rounded-xl px-6 py-3 font-semibold shadow-lg',
    },
  });
};

// Warning Alert
export const showWarningAlert = (title: string, message?: string) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#f59e0b',
    background: '#ffffff',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-neutral-200',
      title: 'text-2xl font-bold text-neutral-900',
      htmlContainer: 'text-neutral-600',
      confirmButton: 'rounded-xl px-6 py-3 font-semibold shadow-lg',
    },
  });
};

// Info Alert
export const showInfoAlert = (title: string, message?: string) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'info',
    confirmButtonText: 'OK',
    confirmButtonColor: '#3b82f6',
    background: '#ffffff',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-neutral-200',
      title: 'text-2xl font-bold text-neutral-900',
      htmlContainer: 'text-neutral-600',
      confirmButton: 'rounded-xl px-6 py-3 font-semibold shadow-lg',
    },
  });
};

// Confirmation Dialog
export const showConfirmDialog = (
  title: string,
  message: string,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#6366f1',
    cancelButtonColor: '#6b7280',
    background: '#ffffff',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-neutral-200',
      title: 'text-2xl font-bold text-neutral-900',
      htmlContainer: 'text-neutral-600',
      confirmButton: 'rounded-xl px-6 py-3 font-semibold shadow-lg mr-2',
      cancelButton: 'rounded-xl px-6 py-3 font-semibold shadow-lg',
    },
  });
};

// Delete Confirmation
export const showDeleteConfirm = (itemName: string) => {
  return Swal.fire({
    title: 'Are you sure?',
    html: `You are about to delete <strong>${itemName}</strong>. This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    background: '#ffffff',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-neutral-200',
      title: 'text-2xl font-bold text-neutral-900',
      htmlContainer: 'text-neutral-600',
      confirmButton: 'rounded-xl px-6 py-3 font-semibold shadow-lg mr-2',
      cancelButton: 'rounded-xl px-6 py-3 font-semibold shadow-lg',
    },
  });
};

// Loading Alert
export const showLoadingAlert = (title: string, message?: string) => {
  return Swal.fire({
    title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    background: '#ffffff',
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-neutral-200',
      title: 'text-2xl font-bold text-neutral-900',
      htmlContainer: 'text-neutral-600',
    },
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Toast Success
export const showToastSuccess = (message: string) => {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#ffffff',
    customClass: {
      popup: 'rounded-xl shadow-lg border border-neutral-200',
      title: 'text-sm font-semibold text-neutral-900',
    },
  });
};

// Toast Error
export const showToastError = (message: string) => {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#ffffff',
    customClass: {
      popup: 'rounded-xl shadow-lg border border-neutral-200',
      title: 'text-sm font-semibold text-neutral-900',
    },
  });
};

// Toast Info
export const showToastInfo = (message: string) => {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'info',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#ffffff',
    customClass: {
      popup: 'rounded-xl shadow-lg border border-neutral-200',
      title: 'text-sm font-semibold text-neutral-900',
    },
  });
};
