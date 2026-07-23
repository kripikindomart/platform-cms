'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { usePortalRouter } from '@/hooks/use-portal-router';
import { tenantsService, Tenant } from '@/lib/api/services/tenants.service';
import { uploadService } from '@/lib/api/services/upload.service';

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
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
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

type FormData = z.infer<typeof formSchema>;

export default function EditTenantPage() {
  const params = useParams();
  const tenantId = params.id as string;
  const { push, router } = usePortalRouter();
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadedLogoFileId, setUploadedLogoFileId] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoChanged, setLogoChanged] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      is_active: true,
      logo_url: '',
      primary_color: '#3B82F6',
      secondary_color: '#06B6D4',
    },
  });

  const isActive = watch('is_active');

  // Fetch tenant data
  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setLoading(true);
        const response = await tenantsService.getDetails(Number(tenantId));
        const tenantData = response.tenant;
        setTenant(tenantData);

        // Pre-fill form
        setValue('name', tenantData.name);
        setValue('slug', tenantData.slug);
        setValue('description', tenantData.description || '');
        setValue('is_active', tenantData.is_active);
        setValue('logo_url', tenantData.logo_url || '');
        setValue('primary_color', tenantData.primary_color || '#3B82F6');
        setValue('secondary_color', tenantData.secondary_color || '#06B6D4');

        // Set logo preview if exists
        if (tenantData.logo_url) {
          setLogoPreview(tenantData.logo_url);
        }
      } catch (error: any) {
        toast.error('Gagal memuat data tenant', {
          description: error?.message,
          duration: 5000,
          closeButton: true,
        });
        // Redirect back if tenant not found
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [tenantId, setValue, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Prepare logo URL
      let logoUrl = data.logo_url;
      if (logoChanged && uploadedLogoFileId) {
        logoUrl = uploadService.getPublicUrl(uploadedLogoFileId);
      }

      // Prepare update data (without description - not supported by backend)
      const updateData: any = {
        name: data.name,
        slug: data.slug,
        is_active: data.is_active,
      };

      if (logoUrl) updateData.logo_url = logoUrl;
      if (data.primary_color) updateData.primary_color = data.primary_color;
      if (data.secondary_color) updateData.secondary_color = data.secondary_color;

      await tenantsService.update(Number(tenantId), updateData);

      toast.success('Tenant berhasil diupdate', {
        description: `Tenant "${data.name}" telah diperbarui`,
        duration: 4000,
        closeButton: true,
      });

      // Redirect to detail page
      push(`/tenants/${tenantId}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan';

      toast.error('Gagal mengupdate tenant', {
        description: errorMessage,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty || logoChanged) {
      if (confirm('Yakin ingin membatalkan? Perubahan yang belum disimpan akan hilang.')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar', {
        closeButton: true,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB', {
        closeButton: true,
      });
      return;
    }

    try {
      setIsUploadingLogo(true);

      // Create local preview first
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Google Drive
      const uploadResult = await uploadService.uploadFile(file);

      // Save file ID for later use
      setUploadedLogoFileId(uploadResult.fileId);
      setLogoChanged(true);

      // Update preview with the uploaded URL
      if (uploadResult.url) {
        setLogoPreview(uploadResult.url);
      }

      toast.success('Logo berhasil diupload ke Google Drive', {
        closeButton: true,
      });
    } catch (error) {
      toast.error('Gagal upload logo', {
        description: 'Silakan coba lagi',
        closeButton: true,
      });
      // Restore original logo on error
      if (tenant?.logo_url) {
        setLogoPreview(tenant.logo_url);
      } else {
        setLogoPreview('');
      }
      setUploadedLogoFileId('');
      setLogoChanged(false);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setUploadedLogoFileId('');
    setLogoChanged(true);
    setValue('logo_url', '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC]">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Tenant tidak ditemukan
          </h3>
          <p className="text-neutral-600 mb-4">
            Tenant dengan ID {tenantId} tidak ditemukan.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Premium Header with Gradient Background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 rounded-2xl border border-neutral-200 shadow-lg shadow-blue-500/10"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="mb-4 gap-2 hover:bg-white/60"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>

          {/* Title with Icon */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Edit Tenant</h1>
              <p className="text-sm text-neutral-600 mt-0.5">
                Update informasi tenant {tenant.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information - Premium Card */}
            <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="text-base font-bold text-neutral-900 mb-1">
                  Informasi Dasar
                </h3>
                <p className="text-xs text-neutral-600">
                  Informasi utama tentang tenant
                </p>
              </div>

              <div className="space-y-3">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-neutral-700">
                    Nama Tenant <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Acme Corporation"
                    {...register('name')}
                    className="mt-1.5 h-10"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Nama organisasi atau perusahaan (3-255 karakter)
                  </p>
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Slug (readonly for edit) */}
                <div>
                  <Label htmlFor="slug" className="text-sm font-semibold text-neutral-700">
                    Slug (URL-friendly)
                  </Label>
                  <Input
                    id="slug"
                    placeholder="acme-corporation"
                    {...register('slug')}
                    disabled
                    className="mt-1.5 h-10 bg-neutral-50 border-neutral-200"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Slug tidak dapat diubah setelah tenant dibuat
                  </p>
                  {errors.slug && (
                    <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-semibold text-neutral-700">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Deskripsi singkat tentang tenant..."
                    rows={3}
                    {...register('description')}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Deskripsi opsional (maksimal 500 karakter)
                  </p>
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Is Active */}
                <div className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 hover:bg-neutral-50 transition-colors">
                  <Checkbox
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={(checked) => setValue('is_active', checked as boolean, { shouldDirty: true })}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5 leading-none">
                    <Label htmlFor="is_active" className="cursor-pointer font-semibold text-sm text-neutral-900">
                      Tenant Aktif
                    </Label>
                    <p className="text-xs text-neutral-600">
                      Aktifkan tenant. Tenant yang non-aktif tidak dapat diakses.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Branding - Premium Card */}
            <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="text-base font-bold text-neutral-900 mb-1">
                  Branding
                </h3>
                <p className="text-xs text-neutral-600">
                  Logo dan warna untuk branding tenant (opsional)
                </p>
              </div>

              <div className="space-y-3">
                {/* Logo Upload */}
                <div>
                  <Label className="text-sm font-semibold text-neutral-700">Logo</Label>
                  <div className="mt-2 space-y-4">
                    {logoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-32 h-32 object-cover rounded-xl border-2 border-neutral-200 shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="danger"
                          size="icon"
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-lg"
                          onClick={handleRemoveLogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {isUploadingLogo ? (
                            <>
                              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-3" />
                              <p className="text-sm text-neutral-700 font-medium">
                                Uploading ke Google Drive...
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                                <Upload className="w-6 h-6 text-blue-500" />
                              </div>
                              <p className="text-sm text-neutral-700 font-medium mb-1">
                                <span className="text-blue-600">Klik untuk upload</span> atau drag & drop
                              </p>
                              <p className="text-xs text-neutral-500">
                                PNG, JPG (max. 5MB)
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                          disabled={isUploadingLogo}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Upload logo tenant ke Google Drive (opsional, max 5MB)
                  </p>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Primary Color */}
                  <div>
                    <Label htmlFor="primary_color" className="text-sm font-semibold text-neutral-700">
                      Warna Utama
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        id="primary_color"
                        type="color"
                        {...register('primary_color')}
                        className="h-11 w-20 cursor-pointer rounded-lg"
                      />
                      <Input
                        type="text"
                        {...register('primary_color')}
                        placeholder="#3B82F6"
                        className="flex-1 h-11"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1.5">Format: #RRGGBB</p>
                    {errors.primary_color && (
                      <p className="text-sm text-red-600 mt-1">{errors.primary_color.message}</p>
                    )}
                  </div>

                  {/* Secondary Color */}
                  <div>
                    <Label htmlFor="secondary_color" className="text-sm font-semibold text-neutral-700">
                      Warna Sekunder
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        {...register('secondary_color')}
                        className="h-11 w-20 cursor-pointer rounded-lg"
                      />
                      <Input
                        type="text"
                        {...register('secondary_color')}
                        placeholder="#06B6D4"
                        className="flex-1 h-11"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1.5">Format: #RRGGBB</p>
                    {errors.secondary_color && (
                      <p className="text-sm text-red-600 mt-1">{errors.secondary_color.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="h-11 px-6"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (!isDirty && !logoChanged)}
                className="h-11 px-6 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
