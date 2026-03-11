'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import MobileSheet from './MobileSheet';

export default function MobileOrb() {
  const [open, setOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const handleTap = () => {
    setTapCount((c) => c + 1);
    setOpen((v) => !v);
  };

  return (
    <>
      {/* Fixed orb container — mobile only */}
      <div
        className="fixed bottom-6 right-6 z-50 md:hidden"
        style={{ width: 56, height: 56, position: 'fixed' }}
      >
        {/* Tap ring — emitted on each tap */}
        <AnimatePresence>
          {tapCount > 0 && (
            <motion.div
              key={tapCount}
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: '50%',
                border: '1px solid rgba(241,90,34,0.6)',
              }}
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Orb button */}
        <motion.button
          onClick={handleTap}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'rgba(241,90,34,0.15)',
            border: '1px solid rgba(241,90,34,0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
          animate={{
            boxShadow: open
              ? '0 0 0 0 rgba(241,90,34,0)'
              : [
                  '0 0 0 0 rgba(241,90,34,0.4)',
                  '0 0 0 12px rgba(241,90,34,0)',
                ],
          }}
          transition={{
            boxShadow: open
              ? { duration: 0.2 }
              : { duration: 2, repeat: Infinity, ease: 'easeOut' },
          }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="orb-close"
                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={22} style={{ color: 'var(--accent)' }} />
              </motion.div>
            ) : (
              <motion.div
                key="orb-logo"
                initial={{ scale: 0, rotate: 90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: 'var(--font-syne)',
                  pointerEvents: 'none',
                }}
              >
                SP
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Bottom sheet */}
      <MobileSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
