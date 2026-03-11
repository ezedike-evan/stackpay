import Sidebar from '@/components/layout/Sidebar';
import DashboardNav from '@/components/layout/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar />
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ background: 'var(--bg-base)' }}
      >
        <DashboardNav />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
