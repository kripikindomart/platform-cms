export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Platform CMS
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Enterprise Content Management System
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
