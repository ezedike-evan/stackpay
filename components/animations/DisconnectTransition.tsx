'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePageTransition } from '@/context/TransitionContext';
import { useWalletContext } from '@/context/WalletContext';

// ── typewriter ────────────────────────────────────────────────────────────────

function useTypewriter(text: string, active: boolean, durationMs: number) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) { setDisplayed(''); return; }
    setDisplayed('');
    const delay = durationMs / text.length;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, delay);
    return () => clearInterval(id);
  }, [active, text, durationMs]);
  return displayed;
}

// ── panel grid (4×3, sorted bottom-right → top-left) ─────────────────────────

const COLS = 4;
const ROWS = 3;

const PANELS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  // Higher sortKey = appears earlier (bottom-right first)
  return { col, row, idx: (ROWS - 1 - row) * COLS + (COLS - 1 - col) };
}).sort((a, b) => b.idx - a.idx);

const PANEL_STAGGER = 65; // ms between panels

// ── main component ────────────────────────────────────────────────────────────

export function DisconnectTransition() {
  const { activeTransition, completeTransition } = usePageTransition();
  const { disconnect } = useWalletContext();
  const router = useRouter();
  const active = activeTransition === 'disconnect';

  const [showText,     setShowText]     = useState(false);
  const [textMode,     setTextMode]     = useState<'disc' | 'bye'>('disc');
  const [showPanels,   setShowPanels]   = useState(false);
  const [panelCount,   setPanelCount]   = useState(0);
  const [showOverlay,  setShowOverlay]  = useState(false);
  const [showCollapse, setShowCollapse] = useState(false);
  const [showLine,     setShowLine]     = useState(false);
  const [showVoid,     setShowVoid]     = useState(false);

  const discText = useTypewriter('Disconnecting...',  showText && textMode === 'disc', 400);
  const byeText  = useTypewriter('Goodbye.',          showText && textMode === 'bye',  200);

  useEffect(() => {
    if (!active) {
      setShowText(false);
      setTextMode('disc');
      setShowPanels(false);
      setPanelCount(0);
      setShowOverlay(false);
      setShowCollapse(false);
      setShowLine(false);
      setShowVoid(false);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    // ── Phase 1: Warning (0–600ms) ──────────────────────────────────────────
    setShowText(true);
    setTextMode('disc');
    setShowOverlay(true);

    // ── Phase 2: Shutdown (600ms–1400ms) ────────────────────────────────────
    timers.push(setTimeout(() => {
      setTextMode('bye');
      setShowPanels(true);

      // Stagger panels bottom-right → top-left
      for (let i = 0; i < PANELS.length; i++) {
        timers.push(setTimeout(() => setPanelCount(i + 1), i * PANEL_STAGGER));
      }
    }, 600));

    // ── Phase 3: Collapse (1400ms–1900ms) ───────────────────────────────────
    timers.push(setTimeout(() => {
      setShowPanels(false);
      setShowText(false);
      setPanelCount(0);
      setShowCollapse(true);

      // Orange line at ~80% of the scaleY animation
      timers.push(setTimeout(() => {
        setShowLine(true);
        timers.push(setTimeout(() => setShowLine(false), 280));
      }, 360));
    }, 1400));

    // ── Phase 4: Void (1900ms) — clear wallet state ──────────────────────────
    timers.push(setTimeout(() => {
      setShowCollapse(false);
      setShowVoid(true);
      setShowOverlay(false);
      disconnect();
    }, 1900));

    // ── Phase 5: Return (2200ms) — navigate ─────────────────────────────────
    timers.push(setTimeout(() => {
      router.push('/');
    }, 2200));

    // ── Complete (2500ms) ────────────────────────────────────────────────────
    timers.push(setTimeout(() => {
      setShowVoid(false);
      completeTransition();
    }, 2500));

    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}>

      {/* Subtle dark overlay (phase 1+) */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'absolute', inset: 0, background: '#000' }}
          />
        )}
      </AnimatePresence>

      {/* Phase 1+2: Typewriter text (top-right, below navbar) */}
      <AnimatePresence mode="wait">
        {showText && textMode === 'disc' && (
          <motion.div
            key="disc-text"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 68,
              right: 24,
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 12,
              color: '#F59E0B',
              letterSpacing: '0.05em',
            }}
          >
            {discText}
          </motion.div>
        )}
        {showText && textMode === 'bye' && (
          <motion.div
            key="bye-text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 68,
              right: 24,
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 12,
              color: '#EF4444',
              letterSpacing: '0.05em',
            }}
          >
            {byeText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Panel turn-off grid */}
      {showPanels && PANELS.map((panel, i) => (
        i < panelCount ? (
          <motion.div
            key={`p-${panel.col}-${panel.row}`}
            initial={{ opacity: 0, background: 'rgba(241,90,34,0.7)' }}
            animate={{
              opacity: [0, 0.85, 0.88],
              background: [
                'rgba(241,90,34,0.7)',
                'rgba(241,90,34,0.7)',
                '#0D0D0D',
              ],
            }}
            transition={{ duration: 0.18, times: [0, 0.25, 1] }}
            style={{
              position: 'absolute',
              left: `${(panel.col / COLS) * 100}%`,
              top:  `${(panel.row / ROWS) * 100}%`,
              width:  `${100 / COLS}%`,
              height: `${100 / ROWS}%`,
            }}
          />
        ) : null
      ))}

      {/* Phase 3: CRT scaleY collapse */}
      <AnimatePresence>
        {showCollapse && (
          <motion.div
            key="collapse"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0.002 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.55, 0, 1, 0.45] as [number, number, number, number],
            }}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#0D0D0D',
              transformOrigin: 'center center',
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 3: Orange glow line at centre */}
      <AnimatePresence>
        {showLine && (
          <motion.div
            key="glow-line"
            initial={{ opacity: 1, scaleX: 1 }}
            animate={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeIn' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 2,
              marginTop: -1,
              background:
                'linear-gradient(90deg, transparent, #F15A22 20%, #F15A22 80%, transparent)',
              boxShadow: '0 0 30px 10px rgba(241,90,34,0.9)',
              transformOrigin: 'center',
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 4: Pure black void */}
      <AnimatePresence>
        {showVoid && (
          <motion.div
            key="void"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'absolute', inset: 0, background: '#000' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
