'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { tenantsService, Tenant } from '@/lib/api/services/tenants.service';
import { usePortalRouter } from '@/hooks/use-portal-router';

interface DangerZoneSettingsProps {
  tenant: Tenant;
}

export default function DangerZoneSettings({ tenant }: DangerZoneSettingsProps) {
  const { push } = usePortalRouter();
  const params = useParams();
  const currentTenantSlug = params.tenant as string;
  
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if this is the current tenant
  const isCurrentTenant = tenant.slug === currentTenantSlug;

  const handleDeactivate = async () => {
    try {
      setLoading(true);
      await tenantsService.deactivate(tenant.id);
      
      toast.success('Tenant berhasil dinonaktifkan', {
        description: 'Tenant tidak dapat diakses sampai diaktifkan kembali',
        duration: 4000,
        closeButton: true,
      });

      setShowDeactivateDialog(false);
      
      // Refresh page
      window.location.reload();
    } catch (error: any) {
      toast.error('Gagal menonaktifkan tenant', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Konfirmasi tidak sesuai', {
        description: 'Ketik "DELETE" untuk konfirmasi',
      });
      return;
    }

    try {
      setLoading(true);
      await tenantsService.delete(tenant.id);
      
      toast.success('Tenant berhasil dihapus', {
        description: 'Tenant dipindahkan ke trash. Anda dapat memulihkannya dari tab Trash.',
        duration: 4000,
        closeButton: true,
      });

      setShowDeleteDialog(false);
      
      // Redirect to tenant list
      push('/tenants');
    } catch (error: any) {
      toast.error('Gagal menghapus tenant', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning for current tenant */}
      {isCurrentTenant && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-900 mb-1">Ini adalah tenant aktif Anda</p>
            <p className="text-yellow-700">
              Anda tidak dapat menonaktifkan atau menghapus tenant yang sedang Anda gunakan. 
              Silakan switch ke tenant lain terlebih dahulu.
            </p>
          </div>
        </div>
      )}

      {/* Deactivate Tenant */}
      <div className="bg-white border-2 border-orange-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-orange-600" />
              <h4 className="font-bold text-neutral-900">Nonaktifkan Tenant</h4>
            </div>
            <p className="text-sm text-neutral-600 mb-3">
              Tenant yang dinonaktifkan tidak dapat diakses oleh users. Semua data tetap tersimpan dan dapat diaktifkan kembali kapan saja.
            </p>
            <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
              <li>Users tidak dapat login ke tenant ini</li>
              <li>API access akan diblokir</li>
              <li>Data tetap tersimpan dan aman</li>
              <li>Dapat diaktifkan kembali kapan saja</li>
            </ul>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowDeactivateDialog(true)}
            disabled={tenant.is_active === false || isCurrentTenant}
            className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800 hover:border-orange-400"
          >
            {tenant.is_active ? 'Nonaktifkan' : 'Sudah Nonaktif'}
          </Button>
        </div>
      </div>

      {/* Delete Tenant */}
      <div className="bg-white border-2 border-red-300 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-neutral-900">Hapus Tenant</h4>
            </div>
            <p className="text-sm text-neutral-600 mb-3">
              <span className="font-semibold text-red-600">Tindakan ini akan memindahkan tenant ke trash.</span> Tenant dapat dipulihkan dari tab Trash di halaman list tenant.
            </p>
            <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
              <li>Tenant dipindahkan ke trash (soft delete)</li>
              <li>Data tetap tersimpan di database</li>
              <li>Dapat dipulihkan dari tab Trash</li>
              <li>Users tidak dapat mengakses tenant</li>
            </ul>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isCurrentTenant}
            className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-400"
          >
            Hapus Tenant
          </Button>
        </div>
      </div>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-700">
              <XCircle className="w-5 h-5" />
              Nonaktifkan Tenant?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Anda yakin ingin menonaktifkan tenant <span className="font-semibold">{tenant.name}</span>?</p>
              <p className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                <strong>Catatan:</strong> Users tidak akan dapat login ke tenant ini sampai diaktifkan kembali.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Menonaktifkan...' : 'Ya, Nonaktifkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="w-5 h-5" />
              Hapus Tenant?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Anda yakin ingin menghapus tenant <span className="font-semibold">{tenant.name}</span>?</p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm space-y-2">
                <p className="font-semibold text-red-900">Yang akan terjadi:</p>
                <ul className="list-disc list-inside space-y-1 text-red-800">
                  <li>Tenant dipindahkan ke trash</li>
                  <li>Users tidak dapat mengakses</li>
                  <li>Dapat dipulihkan dari tab Trash</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Ketik <code className="bg-neutral-100 px-2 py-1 rounded">DELETE</code> untuk konfirmasi:</p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="font-mono"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={loading}
              onClick={() => setDeleteConfirmText('')}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading || deleteConfirmText !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700 font-semibold"
            >
              {loading ? 'Menghapus...' : 'Ya, Hapus Tenant'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
