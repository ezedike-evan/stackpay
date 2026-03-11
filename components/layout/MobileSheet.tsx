'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  LayoutDashboard,
  Send,
  Activity,
  Lock,
  Split,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useWalletContext } from '@/context/WalletContext';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/send', label: 'Send', icon: Send },
  { href: '/stream', label: 'Stream', icon: Activity },
  { href: '/escrow', label: 'Escrow', icon: Lock },
  { href: '/split', label: 'Split', icon: Split },
  { href: '/yield', label: 'Yield', icon: TrendingUp },
  { href: '/invoice', label: 'Invoice', icon: FileText },
];

interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSheet({ open, onClose }: MobileSheetProps) {
  const pathname = usePathname();
  const { isConnected, address } = useWalletContext();
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-sheet-backdrop"
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="mobile-sheet"
            ref={sheetRef}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px 20px 0 0',
              boxShadow: '0 -20px 60px rgba(241,90,34,0.1)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%', transition: { duration: 0.25, ease: 'easeIn' } }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Drag handle */}
            <div
              className="flex justify-center pt-3 pb-1"
              style={{ cursor: 'grab' }}
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.2)',
                }}
              />
            </div>

            {/* Wallet chip — if connected */}
            {isConnected && (
              <div
                className="mx-4 my-2 px-3 py-2 rounded-lg flex items-center gap-2"
                style={{
                  background: 'rgba(34,197,94,0.06)',
                  border: '1px solid rgba(34,197,94,0.15)',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-ibm-plex-mono)',
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {shortAddress}
                </span>
              </div>
            )}

            {/* Nav items */}
            <nav className="px-3 py-2 flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }, i) => {
                const isActive =
                  pathname === href || pathname.startsWith(href + '/');

                return (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl transition-colors"
                      style={{
                        height: 48,
                        paddingLeft: 12,
                        paddingRight: 12,
                        borderLeft: isActive
                          ? '3px solid var(--accent)'
                          : '3px solid transparent',
                        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                        background: isActive
                          ? 'rgba(241,90,34,0.08)'
                          : 'transparent',
                      }}
                    >
                      <Icon size={18} />
                      <span
                        className="text-sm font-medium"
                        style={{ fontFamily: 'var(--font-geist-sans)' }}
                      >
                        {label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer */}
            <div
              className="mx-4 mt-2 mb-4 pt-3 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  fontSize: 11,
                  color: 'var(--text-dim)',
                }}
              >
                Built on Stacks
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono)',
                  fontSize: 11,
                  color: 'var(--text-dim)',
                }}
              >
                v0.1.0
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
