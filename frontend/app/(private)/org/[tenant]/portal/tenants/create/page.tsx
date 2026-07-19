'use client';

import { useState, useEffect } from 'react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { usePortalRouter } from '@/hooks/use-portal-router';
import { tenantsService } from '@/lib/api/services/tenants.service';
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

export default function CreateTenantPage() {
  const { push, router } = usePortalRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      is_active: true,
      logo_url: '',
      primary_color: '#3B82F6', // Default blue
      secondary_color: '#06B6D4', // Default cyan
    },
  });

  // Watch name field untuk auto-generate slug
  const nameValue = watch('name');
  const isActive = watch('is_active');

  useEffect(() => {
    if (nameValue) {
      const generatedSlug = generateSlug(nameValue);
      setValue('slug', generatedSlug);
    }
  }, [nameValue, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Clean up empty optional fields
      const cleanData = {
        name: data.name,
        slug: data.slug,
        ...(data.description && { description: data.description }),
        is_active: data.is_active,
        ...(data.logo_url && { logo_url: data.logo_url }),
        ...(data.primary_color && { primary_color: data.primary_color }),
        ...(data.secondary_color && { secondary_color: data.secondary_color }),
      };

      const newTenant = await tenantsService.create(cleanData);

      toast.success('Tenant berhasil dibuat', {
        description: `Tenant "${newTenant.name}" telah dibuat`,
        duration: 4000,
        closeButton: true,
      });

      // Redirect to tenant detail page
      push(`/tenants/${newTenant.id}`);
    } catch (error: any) {
      console.error('Create tenant error:', error);
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan';
      
      toast.error('Gagal membuat tenant', {
        description: errorMessage,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('Yakin ingin membatalkan? Perubahan yang belum disimpan akan hilang.')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar', {
        closeButton: true,
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB', {
        closeButton: true,
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      setValue('logo_url', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setValue('logo_url', '');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Create New Tenant</h1>
            <p className="text-neutral-600 mt-0.5">
              Buat tenant baru untuk organisasi atau perusahaan
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>
                Informasi utama tentang tenant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">
                  Nama Tenant <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: Acme Corporation"
                  {...register('name')}
                  className="mt-1.5"
                />
                <p className="text-sm text-neutral-500 mt-1">
                  Nama organisasi atau perusahaan (3-255 karakter)
                </p>
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Slug (auto-generated, readonly) */}
              <div>
                <Label htmlFor="slug">Slug (URL-friendly)</Label>
                <Input
                  id="slug"
                  placeholder="acme-corporation"
                  {...register('slug')}
                  disabled
                  className="mt-1.5 bg-neutral-50"
                />
                <p className="text-sm text-neutral-500 mt-1">
                  Otomatis di-generate dari nama (hanya huruf kecil, angka, dan tanda hubung)
                </p>
                {errors.slug && (
                  <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsi singkat tentang tenant..."
                  rows={3}
                  {...register('description')}
                  className="mt-1.5"
                />
                <p className="text-sm text-neutral-500 mt-1">
                  Deskripsi opsional (maksimal 500 karakter)
                </p>
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Is Active */}
              <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <Checkbox
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('is_active', checked as boolean)}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Tenant Aktif
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Aktifkan tenant setelah dibuat. Tenant yang non-aktif tidak dapat diakses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Logo dan warna untuk branding tenant (opsional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Upload */}
              <div>
                <Label>Logo</Label>
                <div className="mt-1.5 space-y-4">
                  {logoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-neutral-200"
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-neutral-400 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                        <p className="text-sm text-neutral-600">
                          <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          PNG, JPG (max. 2MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </label>
                  )}
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  Upload logo tenant (opsional, max 2MB)
                </p>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Color */}
                <div>
                  <Label htmlFor="primary_color">Warna Utama</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Input
                      id="primary_color"
                      type="color"
                      {...register('primary_color')}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      {...register('primary_color')}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">Format: #RRGGBB</p>
                  {errors.primary_color && (
                    <p className="text-sm text-red-600 mt-1">{errors.primary_color.message}</p>
                  )}
                </div>

                {/* Secondary Color */}
                <div>
                  <Label htmlFor="secondary_color">Warna Sekunder</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Input
                      id="secondary_color"
                      type="color"
                      {...register('secondary_color')}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      {...register('secondary_color')}
                      placeholder="#06B6D4"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">Format: #RRGGBB</p>
                  {errors.secondary_color && (
                    <p className="text-sm text-red-600 mt-1">{errors.secondary_color.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Membuat Tenant...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Buat Tenant
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
