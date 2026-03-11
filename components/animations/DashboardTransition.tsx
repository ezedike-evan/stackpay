'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransition } from '@/context/TransitionContext';

// Renders only the boot animation (scanline sweep on direct /dashboard visit).
// Connect and disconnect transitions live in ConnectTransition / DisconnectTransition.

export function DashboardTransition() {
  const { activeTransition, completeTransition } = usePageTransition();

  const [showBlackScreen, setShowBlackScreen] = useState(false);
  const [showScanline,    setShowScanline]    = useState(false);

  useEffect(() => {
    if (activeTransition !== 'boot') return;

    setShowBlackScreen(true);
    setShowScanline(true);

    const t1 = setTimeout(() => setShowScanline(false), 220);
    const t2 = setTimeout(() => {
      setShowBlackScreen(false);
      completeTransition();
    }, 420);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeTransition, completeTransition]);

  return (
    <AnimatePresence>
      {showBlackScreen && (
        <motion.div
          key="boot-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#0D0D0D',
            pointerEvents: 'none',
          }}
        >
          {showScanline && (
            <motion.div
              initial={{ top: 0 }}
              animate={{ top: '100%' }}
              transition={{ duration: 0.2, ease: 'linear' }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 3,
                background:
                  'linear-gradient(90deg, transparent, #F15A22 30%, #F15A22 70%, transparent)',
                boxShadow: '0 0 24px #F15A22, 0 0 8px #F15A22',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
