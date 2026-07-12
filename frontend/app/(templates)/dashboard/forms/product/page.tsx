'use client';

import { useState } from 'react';
import { FloatingSidebar } from '@/components/templates/layouts/floating-sidebar';
import { FormSection, FormField, FileUpload, FormSuccess } from '@/components/templates/forms';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Package, Image as ImageIcon, DollarSign, Loader2 } from 'lucide-react';

export default function ProductFormPage() {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    comparePrice: '',
    stock: '',
    description: '',
    featured: false,
    active: true,
  });
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.stock) newErrors.stock = 'Stock quantity is required';
    if (images.length === 0) newErrors.images = 'At least one product image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen bg-[#FAFBFC]">
        <FloatingSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <FormSuccess
              title="Product Created!"
              message="Your product has been successfully added to the catalog and is now live."
              actionLabel="Add Another Product"
              onAction={() => {
                setIsSuccess(false);
                setFormData({
                  name: '',
                  sku: '',
                  category: '',
                  price: '',
                  comparePrice: '',
                  stock: '',
                  description: '',
                  featured: false,
                  active: true,
                });
                setImages([]);
              }}
              secondaryLabel="View Products"
              onSecondary={() => setIsSuccess(false)}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      <FloatingSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Product Form
            </h1>
            <p className="text-neutral-600">
              Add or edit product with images, pricing, and inventory.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <FormSection
              title="Basic Information"
              description="Product name, SKU, and category"
              icon={Package}
            >
              <FormField label="Product Name" required error={errors.name}>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Premium Wireless Headphones"
                  className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="SKU" required error={errors.sku}>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="WH-1000XM5"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
                <FormField label="Category" required error={errors.category}>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={[
                      { value: '', label: 'Select category' },
                      { value: 'electronics', label: 'Electronics' },
                      { value: 'clothing', label: 'Clothing' },
                      { value: 'accessories', label: 'Accessories' },
                      { value: 'home', label: 'Home & Living' },
                    ]}
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
              </div>

              <FormField label="Description" hint="Detailed product description">
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product in detail..."
                  rows={4}
                  className="rounded-xl border-neutral-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </FormField>
            </FormSection>

            {/* Product Images */}
            <FormSection
              title="Product Images"
              description="Upload product photos (max 5MB each)"
              icon={ImageIcon}
            >
              <FileUpload
                accept="image/*"
                maxSize={5}
                multiple
                onFilesChange={setImages}
              />
              {errors.images && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  {errors.images}
                </p>
              )}
            </FormSection>

            {/* Pricing & Inventory */}
            <FormSection
              title="Pricing & Inventory"
              description="Set pricing and stock levels"
              icon={DollarSign}
            >
              <div className="grid md:grid-cols-3 gap-4">
                <FormField label="Price" required error={errors.price}>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="99.99"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
                <FormField label="Compare at Price" hint="Original price">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    placeholder="149.99"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
                <FormField label="Stock Quantity" required error={errors.stock}>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="100"
                    className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </FormField>
              </div>

              {/* Status Toggles */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">Featured Product</p>
                    <p className="text-xs text-neutral-600">Show on homepage</p>
                  </div>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, featured: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">Active Status</p>
                    <p className="text-xs text-neutral-600">Available for purchase</p>
                  </div>
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, active: checked })
                    }
                  />
                </div>
              </div>
            </FormSection>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                className="h-12 rounded-xl border-2 border-neutral-200 px-6 text-sm font-semibold hover:bg-neutral-50 transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Create Product'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
