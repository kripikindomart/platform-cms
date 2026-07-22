'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';
import { toast } from 'sonner';
import { tenantsService } from '@/lib/api/services/tenants.service';

interface AddUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: number;
  onSuccess: () => void;
}

export default function AddUsersModal({ isOpen, onClose, tenantId, onSuccess }: AddUsersModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [defaultRoleId, setDefaultRoleId] = useState<string>('2'); // Default role ID

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    } else {
      // Reset on close
      setSearch('');
      setSelectedUserIds([]);
      setAvailableUsers([]);
    }
  }, [isOpen, search]);

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await tenantsService.getAvailableUsers(tenantId, search || undefined);
      setAvailableUsers(users);
    } catch (error: any) {
      toast.error('Gagal memuat users', {
        description: error?.message,
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(availableUsers.map(u => Number(u.id)));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    const numericUserId = Number(userId);
    
    setSelectedUserIds(prev => {
      // Create a Set to ensure uniqueness
      const currentIds = new Set(prev);
      
      if (checked) {
        currentIds.add(numericUserId);
      } else {
        currentIds.delete(numericUserId);
      }
      
      return Array.from(currentIds);
    });
  };

  const handleAssign = async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Pilih minimal 1 user');
      return;
    }

    if (!defaultRoleId) {
      toast.error('Pilih role untuk users');
      return;
    }

    try {
      setLoading(true);
      
      // Pastikan semua IDs adalah number
      const payload = {
        user_ids: selectedUserIds.map(id => Number(id)),
        default_role_id: Number(defaultRoleId),
      };
      
      const result = await tenantsService.bulkAddUsers(tenantId, payload);

      if (result.failed === 0) {
        toast.success(`${result.success} user berhasil ditambahkan`, {
          duration: 3000,
        });
      } else if (result.success === 0) {
        toast.error('Gagal menambahkan semua users', {
          description: result.errors[0]?.message || 'Unknown error',
        });
      } else {
        toast.warning(`${result.success} berhasil, ${result.failed} gagal`, {
          description: result.errors.slice(0, 2).map(e => e.message).join(', '),
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Gagal menambahkan users', {
        description: error?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const isAllSelected = availableUsers.length > 0 && selectedUserIds.length === availableUsers.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col !bg-white shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 -m-4 p-6 mb-6 rounded-t-xl border-b border-neutral-200">
          <DialogTitle className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Tambah User ke Tenant
          </DialogTitle>
          <DialogDescription className="text-neutral-600">
            Pilih users dan assign role untuk menambahkan ke tenant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search & Role Selector */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Cari user (nama atau email)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-48">
              <Select value={defaultRoleId} onValueChange={setDefaultRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Admin</SelectItem>
                  <SelectItem value="2">User</SelectItem>
                  <SelectItem value="3">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Select All */}
          {availableUsers.length > 0 && (
            <div className="flex items-center gap-2 py-2 border-b border-neutral-200">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-semibold text-neutral-700">
                Pilih Semua ({availableUsers.length} users)
              </span>
              {selectedUserIds.length > 0 && (
                <span className="text-sm text-blue-600">
                  {selectedUserIds.length} terpilih
                </span>
              )}
            </div>
          )}

          {/* Users List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loadingUsers ? (
              <div className="text-center py-8 text-neutral-500">Loading users...</div>
            ) : availableUsers.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                {search ? 'Tidak ada user yang cocok' : 'Semua user sudah ada di tenant'}
              </div>
            ) : (
              availableUsers.map((user) => {
                const isSelected = selectedUserIds.includes(Number(user.id));
                
                return (
                  <div
                    key={user.id}
                    className={`p-4 border rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-neutral-200 hover:border-blue-200 hover:bg-blue-50/30'
                    }`}
                    onClick={() => handleSelectUser(user.id, !isSelected)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">
                          {user.name || 'No Name'}
                        </p>
                        <p className="text-sm text-neutral-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || selectedUserIds.length === 0}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg"
          >
            {loading ? 'Menambahkan...' : `Tambahkan ${selectedUserIds.length} User`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
