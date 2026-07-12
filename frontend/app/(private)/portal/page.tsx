import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const stats = [
    { title: 'Total Users', value: '0', description: 'Active users in the system' },
    { title: 'Active Tenants', value: '0', description: 'Currently active tenants' },
    { title: 'Roles', value: '0', description: 'Total roles configured' },
    { title: 'Permissions', value: '0', description: 'Total permissions available' },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Selamat datang di Platform CMS"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-neutral-600">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
              <p className="text-xs text-neutral-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Platform CMS MVP - Phase 1</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">
            Dashboard ini akan dikembangkan lebih lanjut setelah backend API selesai dibuat.
            Untuk saat ini, ini adalah tampilan awal dari aplikasi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
