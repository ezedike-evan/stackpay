'use client';
import { WalletChip } from '@/components/wallet/WalletDropdown';

export default function DashboardNav() {
  return (
    <header
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid var(--bg-border)',
        background: 'var(--bg-surface)',
      }}
    >
      <span>
      </span>
      <WalletChip />
    </header>
  );
}
