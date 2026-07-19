'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Server, HardDrive, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProviderSelectorProps {
  settings: any;
  onSave: (value: any) => void;
  saving: boolean;
}

export function ProviderSelector({ settings, onSave, saving }: ProviderSelectorProps) {
  const [selected, setSelected] = useState(settings?.provider?.active_provider || 'google-drive');

  const providers = [
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Upload ke Google Drive dengan OAuth2',
      icon: Cloud,
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 's3',
      name: 'Amazon S3',
      description: 'AWS S3 atau S3-compatible storage',
      icon: Server,
      gradient: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      id: 'local',
      name: 'Local Storage',
      description: 'Simpan file di server (development only)',
      icon: HardDrive,
      gradient: 'from-neutral-500 to-neutral-700',
      bgColor: 'bg-neutral-50',
      borderColor: 'border-neutral-200',
    },
  ];

  const handleSave = () => {
    onSave({
      active_provider: selected,
      fallback_provider: 'local',
    });
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-neutral-900 mb-2">
          Storage Provider
        </h3>
        <p className="text-sm text-neutral-600">
          Pilih provider untuk menyimpan file yang diupload
        </p>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {providers.map((provider) => {
          const Icon = provider.icon;
          const isSelected = selected === provider.id;

          return (
            <motion.button
              key={provider.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(provider.id)}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all text-left',
                isSelected
                  ? `${provider.borderColor} ${provider.bgColor} shadow-lg`
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              )}
            >
              {/* Selected Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${provider.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h4 className="font-semibold text-neutral-900 mb-1">
                {provider.name}
              </h4>
              <p className="text-xs text-neutral-600">
                {provider.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
        <Button
          onClick={handleSave}
          disabled={saving || selected === settings?.provider?.active_provider}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30"
        >
          {saving ? 'Menyimpan...' : 'Simpan Provider'}
        </Button>
      </div>
    </div>
  );
}
