import Sidebar from '@/components/layout/Sidebar';
import DashboardNav from '@/components/layout/DashboardNav';
import MobileOrb from '@/components/layout/MobileOrb';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className="flex flex-col flex-1 overflow-hidden min-w-0"
        style={{ background: 'var(--bg-base)' }}
      >
        <DashboardNav />
        <main className="flex-1 overflow-y-auto overflow-x-hidden touch-pan-y">
          {children}
        </main>
      </div>
      <MobileOrb />
    </div>
  );
}
