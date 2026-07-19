'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usersService, User } from '@/lib/api/services/users.service';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().optional(),
  is_active: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      password: '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
      is_active: user?.is_active ?? true,
    },
  });

  const isActive = watch('is_active');

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);

      // Remove empty password for edit
      if (isEdit && !data.password) {
        delete data.password;
      }

      if (isEdit && user) {
        await usersService.update(user.id, data);
        toast.success('User updated successfully');
      } else {
        await usersService.create(data as any);
        toast.success('User created successfully');
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(isEdit ? 'Failed to update user' : 'Failed to create user', {
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-6">User Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="md:col-span-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="user@example.com"
              className="mt-1.5"
              disabled={isEdit} // Can't change email in edit mode
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="md:col-span-2">
            <Label htmlFor="password">
              Password {!isEdit && <span className="text-red-500">*</span>}
              {isEdit && <span className="text-neutral-500 text-xs ml-2">(Leave blank to keep current)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder={isEdit ? '••••••••' : 'Enter password'}
              className="mt-1.5"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              {...register('first_name')}
              placeholder="John"
              className="mt-1.5"
            />
            {errors.first_name && (
              <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              {...register('last_name')}
              placeholder="Doe"
              className="mt-1.5"
            />
            {errors.last_name && (
              <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="md:col-span-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              {...register('phone_number')}
              placeholder="+1 (555) 000-0000"
              className="mt-1.5"
            />
            {errors.phone_number && (
              <p className="text-sm text-red-600 mt-1">{errors.phone_number.message}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl">
              <div>
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-neutral-500 mt-1">
                  {isActive ? 'User can log in and access the system' : 'User cannot log in'}
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}
