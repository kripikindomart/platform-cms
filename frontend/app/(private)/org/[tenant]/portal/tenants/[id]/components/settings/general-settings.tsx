'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-radix';
import { toast } from 'sonner';
import { tenantsService, Tenant } from '@/lib/api/services/tenants.service';

interface GeneralSettingsProps {
  tenant: Tenant;
  onUpdate: () => void;
}

interface TenantConfig {
  timezone?: string;
  date_format?: string;
  language?: string;
  contact_email?: string;
}

export default function GeneralSettings({ tenant, onUpdate }: GeneralSettingsProps) {
  const [loading, setLoading] = useState(false);
  
  const currentConfig: TenantConfig = (tenant.config as TenantConfig) || {};
  
  const [timezone, setTimezone] = useState(currentConfig.timezone || 'UTC');
  const [dateFormat, setDateFormat] = useState(currentConfig.date_format || 'DD/MM/YYYY');
  const [language, setLanguage] = useState(currentConfig.language || 'id');
  const [contactEmail, setContactEmail] = useState(currentConfig.contact_email || '');

  const hasChanges = 
    timezone !== (currentConfig.timezone || 'UTC') ||
    dateFormat !== (currentConfig.date_format || 'DD/MM/YYYY') ||
    language !== (currentConfig.language || 'id') ||
    contactEmail !== (currentConfig.contact_email || '');

  const handleSave = async () => {
    try {
      setLoading(true);

      const newConfig: TenantConfig = {
        ...currentConfig,
        timezone,
        date_format: dateFormat,
        language,
        contact_email: contactEmail,
      };

      await tenantsService.updateConfig(tenant.id, newConfig);

      toast.success('Pengaturan umum berhasil diperbarui', {
        duration: 3000,
        closeButton: true,
      });

      onUpdate();
    } catch (error: any) {
      toast.error('Gagal memperbarui pengaturan', {
        description: error?.message,
        duration: 5000,
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Timezone */}
      <div className="space-y-3">
        <Label htmlFor="timezone" className="text-sm font-semibold text-neutral-700">
          Timezone
        </Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger id="timezone" className="w-full">
            <SelectValue placeholder="Pilih timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC - Coordinated Universal Time</SelectItem>
            <SelectItem value="Asia/Jakarta">Asia/Jakarta - WIB (UTC+7)</SelectItem>
            <SelectItem value="Asia/Makassar">Asia/Makassar - WITA (UTC+8)</SelectItem>
            <SelectItem value="Asia/Jayapura">Asia/Jayapura - WIT (UTC+9)</SelectItem>
            <SelectItem value="America/New_York">America/New York - EST (UTC-5)</SelectItem>
            <SelectItem value="America/Los_Angeles">America/Los Angeles - PST (UTC-8)</SelectItem>
            <SelectItem value="Europe/London">Europe/London - GMT (UTC+0)</SelectItem>
            <SelectItem value="Asia/Singapore">Asia/Singapore - SGT (UTC+8)</SelectItem>
            <SelectItem value="Asia/Tokyo">Asia/Tokyo - JST (UTC+9)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-neutral-500">
          Timezone yang digunakan untuk tampilan tanggal dan waktu
        </p>
      </div>

      {/* Date Format */}
      <div className="space-y-3">
        <Label htmlFor="date-format" className="text-sm font-semibold text-neutral-700">
          Format Tanggal
        </Label>
        <Select value={dateFormat} onValueChange={setDateFormat}>
          <SelectTrigger id="date-format" className="w-full">
            <SelectValue placeholder="Pilih format tanggal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (21/07/2026)</SelectItem>
            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (07/21/2026)</SelectItem>
            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-07-21)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-neutral-500">
          Format tampilan tanggal di seluruh aplikasi
        </p>
      </div>

      {/* Language */}
      <div className="space-y-3">
        <Label htmlFor="language" className="text-sm font-semibold text-neutral-700">
          Bahasa
        </Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger id="language" className="w-full">
            <SelectValue placeholder="Pilih bahasa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">Bahasa Indonesia</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-neutral-500">
          Bahasa yang digunakan untuk interface dan notifikasi
        </p>
      </div>

      {/* Contact Email */}
      <div className="space-y-3">
        <Label htmlFor="contact-email" className="text-sm font-semibold text-neutral-700">
          Email Kontak
        </Label>
        <Input
          id="contact-email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="admin@tenant.com"
          className="w-full"
        />
        <p className="text-xs text-neutral-500">
          Email yang digunakan untuk notifikasi dan komunikasi tenant
        </p>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-neutral-200">
        <Button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
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
