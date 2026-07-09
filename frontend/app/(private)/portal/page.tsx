export default function PortalPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Selamat datang di Platform CMS
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Users
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            0
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Active Tenants
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            0
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Roles
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            0
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Permissions
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            0
          </div>
        </div>
      </div>

      {/* Welcome message */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Platform CMS MVP - Phase 1
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Dashboard ini akan dikembangkan lebih lanjut setelah backend API selesai dibuat.
          Untuk saat ini, ini adalah tampilan awal dari aplikasi.
        </p>
      </div>
    </div>
  );
}
