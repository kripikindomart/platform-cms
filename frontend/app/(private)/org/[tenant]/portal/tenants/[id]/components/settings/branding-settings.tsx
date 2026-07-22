'use client';

import { useState } from 'react';
import { Upload, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { tenantsService, Tenant } from '@/lib/api/services/tenants.service';
import { uploadService } from '@/lib/api/services/upload.service';

interface BrandingSettingsProps {
  tenant: Tenant;
  onUpdate: () => void;
}

export default function BrandingSettings({ tenant, onUpdate }: BrandingSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(tenant.logo_url || null);
  const [primaryColor, setPrimaryColor] = useState(tenant.primary_color || '#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState(tenant.secondary_color || '#06b6d4');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar', {
        description: 'Maksimal ukuran file adalah 2MB',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Format file tidak valid', {
        description: 'Hanya file gambar yang diperbolehkan (JPG, PNG, dll)',
      });
      return;
    }

    setLogoFile(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let logoUrl = tenant.logo_url;

      // Upload logo if changed
      if (logoFile) {
        const uploadedFile = await uploadService.uploadFile(logoFile);
        // Backend already returns the full URL in the response
        logoUrl = uploadedFile.url;
      }

      // Update tenant branding (only if logoUrl is not null)
      const updateData: any = {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      };

      if (logoUrl !== null) {
        updateData.logo_url = logoUrl;
      }

      await tenantsService.update(tenant.id, updateData);

      toast.success('Branding berhasil diperbarui', {
        duration: 3000,
        closeButton: true,
      });

      onUpdate();
    } catch (error: any) {
      toast.error('Gagal memperbarui branding', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = logoFile !== null || 
    primaryColor !== (tenant.primary_color || '#3b82f6') ||
    secondaryColor !== (tenant.secondary_color || '#06b6d4');

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="space-y-3">
        <Label htmlFor="logo" className="text-sm font-semibold text-neutral-700">
          Logo Tenant
        </Label>
        
        <div className="flex items-start gap-6">
          {/* Preview */}
          <div className="flex-shrink-0">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-24 h-24 rounded-xl object-cover border-2 border-neutral-200 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-neutral-100 border-2 border-neutral-200 border-dashed flex items-center justify-center">
                <Palette className="w-8 h-8 text-neutral-400" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('logo')?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Logo
              </Button>
              {logoFile && (
                <span className="text-sm text-neutral-600">
                  {logoFile.name} ({(logoFile.size / 1024).toFixed(0)}KB)
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              Format: JPG, PNG. Maksimal 2MB. Rekomendasi: 512x512px
            </p>
          </div>
        </div>
      </div>

      {/* Primary Color */}
      <div className="space-y-3">
        <Label htmlFor="primary-color" className="text-sm font-semibold text-neutral-700">
          Warna Utama (Primary Color)
        </Label>
        <div className="flex items-center gap-4">
          <Input
            id="primary-color"
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-20 h-10 cursor-pointer"
          />
          <Input
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            placeholder="#3b82f6"
            className="w-32"
            maxLength={7}
          />
          <div 
            className="w-10 h-10 rounded-lg shadow-sm border border-neutral-200"
            style={{ backgroundColor: primaryColor }}
          />
          <span className="text-sm text-neutral-600">
            Digunakan untuk button, link, dan elemen utama
          </span>
        </div>
      </div>

      {/* Secondary Color */}
      <div className="space-y-3">
        <Label htmlFor="secondary-color" className="text-sm font-semibold text-neutral-700">
          Warna Sekunder (Secondary Color)
        </Label>
        <div className="flex items-center gap-4">
          <Input
            id="secondary-color"
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            className="w-20 h-10 cursor-pointer"
          />
          <Input
            type="text"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            placeholder="#06b6d4"
            className="w-32"
            maxLength={7}
          />
          <div 
            className="w-10 h-10 rounded-lg shadow-sm border border-neutral-200"
            style={{ backgroundColor: secondaryColor }}
          />
          <span className="text-sm text-neutral-600">
            Digunakan untuk aksen dan elemen pendukung
          </span>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-neutral-200">
        <Button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
        {!hasChanges && (
          <span className="ml-3 text-sm text-neutral-500">
            Tidak ada perubahan
          </span>
        )}
      </div>
    </div>
  );
}
