'use client';

import Link from 'next/link';
import { WalletChip } from '@/components/wallet/WalletDropdown';

export default function DashboardNav() {
  return (
    <header
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid var(--bg-border)',
        background: 'var(--bg-surface)',
      }}
      className="flex-shrink-0"
    >
      {/* Logo — mobile only (sidebar is hidden on mobile) */}
      <Link href="/dashboard" className="flex md:hidden items-center gap-2">
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
            fontFamily: 'var(--font-syne)',
            flexShrink: 0,
          }}
        >
          SP
        </div>
        <span
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--text-primary)',
          }}
        >
          <span style={{ color: 'var(--accent)' }}>Stack</span>Pay
        </span>
      </Link>

      {/* Spacer — desktop (sidebar has the logo) */}
      <span className="hidden md:block" />

      <WalletChip />
    </header>
  );
}
