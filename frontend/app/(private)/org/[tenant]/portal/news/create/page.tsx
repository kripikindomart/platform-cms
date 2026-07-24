'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { usePortalRouter } from '@/hooks/use-portal-router';
import { newsService } from '@/lib/api/services/news.service';

const formSchema = z.object({
  uuid: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
  date: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

/**
 * Create news Page
 * @generated
 */
export default function CreateNewsPage() {
  const { push } = usePortalRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uuid: '',
      title: '',
      content: '',
      image: '',
      date: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
      };
      await newsService.create(payload as any);
      toast.success('news berhasil dibuat');
      push('news');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat news');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => push('news')} className="-ml-3">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <h1 className="text-3xl font-bold text-neutral-900">Tambah news</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="rounded-2xl border-neutral-100 shadow-sm">
            <CardHeader>
              <CardTitle>Informasi news</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="uuid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uuid</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => push('news')}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
