'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Building2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { tenantsService } from '@/lib/api/services/tenants.service';
import { uploadService } from '@/lib/api/services/upload.service';
import { usePortalRouter } from '@/hooks/use-portal-router';
import { PortalLink } from '@/components/ui/portal-link';
import { generateSlug } from '@/lib/utils/slug';

// Validation schema
const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(255, 'Nama maksimal 255 karakter'),
  slug: z
    .string()
    .min(1, 'Slug wajib diisi')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  is_active: z.boolean(),
  logo_url: z.string().optional().or(z.literal('')),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Warna harus format hex (#RRGGBB)')
    .optional()
    .or(z.literal('')),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Warna harus format hex (#RRGGBB)')
    .optional()
    .or(z.literal('')),
});

type TenantFormData = z.infer<typeof formSchema>;

export default function CreateTenantPage() {
  const { push } = usePortalRouter();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<TenantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      is_active: true,
      logo_url: '',
      primary_color: '#3B82F6',
      secondary_color: '#06B6D4',
    },
  });

  // Auto-generate slug dari name
  const watchName = form.watch('name');
  useEffect(() => {
    if (watchName) {
      const slug = generateSlug(watchName);
      form.setValue('slug', slug, { shouldValidate: true });
    }
  }, [watchName, form]);

  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar', {
        description: 'Maksimal ukuran file adalah 2MB',
      });
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Format file tidak didukung', {
        description: 'Hanya file JPG dan PNG yang diizinkan',
      });
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    form.setValue('logo_url', '');
  };

  // Submit form
  const onSubmit = async (data: TenantFormData) => {
    let uploadedFileId: string | null = null;
    
    try {
      setLoading(true);

      // 1. Upload logo jika ada file
      let logoUrl: string | undefined = undefined;
      if (logoFile) {
        toast.info('Uploading logo to Google Drive...', { duration: 2000 });
        
        try {
          const uploadResult = await uploadService.uploadFile(logoFile);
          uploadedFileId = uploadResult.fileId; // Save for cleanup if tenant creation fails
          
          // Backend already returns the full URL
          logoUrl = uploadResult.url;
          
          toast.success('Logo uploaded successfully', { duration: 2000 });
        } catch (uploadError: any) {
          throw new Error(uploadError.message || 'Gagal upload logo ke Google Drive');
        }
      }

      // 2. Create tenant dengan logo URL
      // Only send fields that backend accepts (no description field in DTO)
      const submitData: any = {
        name: data.name,
        slug: data.slug,
        is_active: data.is_active,
      };
      
      // Only add optional fields if they have values
      if (logoUrl) {
        submitData.logo_url = logoUrl;
      }
      
      if (data.primary_color && data.primary_color !== '') {
        submitData.primary_color = data.primary_color;
      }
      
      if (data.secondary_color && data.secondary_color !== '') {
        submitData.secondary_color = data.secondary_color;
      }

      const result = await tenantsService.provision(submitData);

      toast.success('Tenant berhasil dibuat', {
        description: `Tenant "${result.tenant.name}" telah berhasil dibuat dengan schema dan tables`,
        duration: 4000,
      });

      // Redirect to detail page
      push(`/tenants/${result.tenant.id}`);
    } catch (error: any) {
      // Cleanup: Delete uploaded logo if tenant creation failed
      if (uploadedFileId) {
        try {
          await uploadService.deleteFile(uploadedFileId);
          toast.info('Logo yang di-upload sudah dibersihkan', { duration: 3000 });
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded logo:', cleanupError);
        }
      }
      
      toast.error('Gagal membuat tenant', {
        description: error?.message || 'Terjadi kesalahan saat membuat tenant',
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PortalLink href="/tenants">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </PortalLink>

          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Create New Tenant</h1>
            <p className="text-neutral-600 mt-1">Buat tenant baru untuk organisasi</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm">
          {/* Basic Information */}
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Informasi Dasar</h3>
                <p className="text-sm text-neutral-600">Nama dan identifikasi tenant</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Nama Tenant <span className="text-red-500">*</span>
                </label>
                <Input
                  {...form.register('name')}
                  placeholder="Contoh: ACME Corporation"
                  className={form.formState.errors.name ? 'border-red-500' : ''}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  {...form.register('slug')}
                  placeholder="acme-corporation"
                  disabled
                  className="bg-neutral-50 cursor-not-allowed"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Slug akan otomatis di-generate dari nama tenant
                </p>
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.slug.message}</p>
                )}
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                <Checkbox
                  checked={form.watch('is_active')}
                  onCheckedChange={(checked) => form.setValue('is_active', checked as boolean)}
                />
                <div>
                  <label className="text-sm font-medium text-neutral-900">Aktifkan Tenant</label>
                  <p className="text-xs text-neutral-600">
                    Tenant yang aktif dapat diakses oleh users
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Branding</h3>
                <p className="text-sm text-neutral-600">Logo dan warna tenant</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Logo</label>
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-32 h-32 object-contain border border-neutral-200 rounded-xl p-2"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                      <p className="text-sm font-medium text-neutral-700">
                        Click untuk upload logo
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">JPG atau PNG, max 2MB</p>
                    </label>
                  </div>
                )}
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      {...form.register('primary_color')}
                      className="w-16 h-10 rounded-lg border border-neutral-300 cursor-pointer"
                    />
                    <Input
                      {...form.register('primary_color')}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                  {form.formState.errors.primary_color && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.primary_color.message}
                    </p>
                  )}
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      {...form.register('secondary_color')}
                      className="w-16 h-10 rounded-lg border border-neutral-300 cursor-pointer"
                    />
                    <Input
                      {...form.register('secondary_color')}
                      placeholder="#06B6D4"
                      className="flex-1"
                    />
                  </div>
                  {form.formState.errors.secondary_color && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.secondary_color.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 bg-neutral-50 rounded-b-2xl">
            <div className="flex items-center justify-end gap-3">
              <PortalLink href="/tenants">
                <Button type="button" variant="outline" disabled={loading}>
                  Batal
                </Button>
              </PortalLink>
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg"
              >
                {loading ? 'Membuat...' : 'Buat Tenant'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
