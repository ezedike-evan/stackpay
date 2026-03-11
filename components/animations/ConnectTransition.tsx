'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransition } from '@/context/TransitionContext';

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

// ── canvas ring renderer ──────────────────────────────────────────────────────

const RING_CONFIGS = [
  { delay: 0,   width: 8 },
  { delay: 80,  width: 6 },
  { delay: 160, width: 4 },
  { delay: 240, width: 3 },
  { delay: 320, width: 2 },
  { delay: 400, width: 1 },
  { delay: 480, width: 1 },
];
const RING_DURATION = 600;

function drawRings(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  elapsed: number,
  maxR: number,
): boolean {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let anyActive = false;

  for (const ring of RING_CONFIGS) {
    const t = Math.min(Math.max(0, elapsed - ring.delay) / RING_DURATION, 1);
    if (t <= 0) { anyActive = true; continue; }
    // cubic ease-out
    const ease = 1 - Math.pow(1 - t, 3);
    const r = 100 + ease * (maxR - 100);
    const alpha = (1 - t) * (ring.delay === 0 ? 0.9 : 0.65);
    ctx.beginPath();
    ctx.arc(ox, oy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(241,90,34,${alpha.toFixed(3)})`;
    ctx.lineWidth = ring.width;
    ctx.stroke();
    if (t < 1) anyActive = true;
  }
  return anyActive;
}

// ── main component ────────────────────────────────────────────────────────────

export function ConnectTransition() {
  const { activeTransition, origin, completeTransition } = usePageTransition();
  const active = activeTransition === 'connect';

  // Internal phase: 0=idle 1=recognition 2=breach 3=surge 4=materialise
  const [phase, setPhase] = useState(0);
  const [showVerifying, setShowVerifying] = useState(false);
  const [showGranted,   setShowGranted]   = useState(false);
  const [showCross,     setShowCross]     = useState(false);
  const [showFlash,     setShowFlash]     = useState(false);
  const [showWipe,      setShowWipe]      = useState(false);
  const [showRings,     setShowRings]     = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  const verifyText  = useTypewriter('Verifying wallet...', showVerifying, 600);
  const grantedText = useTypewriter('Access granted.',     showGranted,   400);

  // ── canvas rings ────────────────────────────────────────────────────────────
  const startRings = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxR     = window.innerWidth * 0.7;
    const start    = performance.now();

    function frame() {
      const elapsed = performance.now() - start;
      const still   = drawRings(ctx!, origin.x, origin.y, elapsed, maxR);
      if (still) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setShowRings(false);
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }, [origin]);

  // ── phase sequencer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) {
      setPhase(0);
      setShowVerifying(false);
      setShowGranted(false);
      setShowCross(false);
      setShowFlash(false);
      setShowWipe(false);
      setShowRings(false);
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1 — Recognition (0–800ms)
    setPhase(1);
    setShowVerifying(true);

    // Phase 2 — Breach (800ms)
    timers.push(setTimeout(() => {
      setPhase(2);
      setShowVerifying(false);
      setShowRings(true);
      timers.push(setTimeout(() => setShowGranted(true), 100));
      timers.push(setTimeout(() => startRings(), 30));
    }, 800));

    // Phase 3 — Surge (1400ms)
    timers.push(setTimeout(() => {
      setPhase(3);
      setShowGranted(false);
      setShowRings(false);
      setShowCross(true);
      timers.push(setTimeout(() => { setShowFlash(true);  }, 300));
      timers.push(setTimeout(() => { setShowFlash(false); }, 380));
    }, 1400));

    // Phase 4 — Materialise (2000ms)
    timers.push(setTimeout(() => {
      setPhase(4);
      setShowCross(false);
      setShowWipe(true);
    }, 2000));

    // Done (3200ms)
    timers.push(setTimeout(() => {
      setShowWipe(false);
      setPhase(0);
      completeTransition();
    }, 3200));

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active && phase === 0) return null;

  const overlayOpacity =
    phase === 4 ? 0    :
    phase === 3 ? 0.95 :
    phase === 2 ? 0.85 :
    phase === 1 ? 0.4  : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>

      {/* Dark overlay — dims and clears across phases */}
      <motion.div
        style={{ position: 'absolute', inset: 0, background: '#000' }}
        animate={{ opacity: overlayOpacity }}
        transition={{ duration: 0.4 }}
      />

      {/* Phase 1 — Button glow at origin */}
      {phase === 1 && (
        <motion.div
          style={{
            position: 'absolute',
            width: 160,
            height: 40,
            borderRadius: 8,
            border: '1px solid rgba(241,90,34,0.4)',
            left: origin.x - 80,
            top:  origin.y - 20,
          }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(241,90,34,0)',
              '0 0 0 40px rgba(241,90,34,0.8)',
              '0 0 0 0 rgba(241,90,34,0)',
              '0 0 0 40px rgba(241,90,34,0.8)',
              '0 0 0 0 rgba(241,90,34,0)',
              '0 0 0 40px rgba(241,90,34,0.8)',
              '0 0 0 0 rgba(241,90,34,0)',
            ],
          }}
          transition={{ duration: 2, times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1] }}
        />
      )}

      {/* Verifying text */}
      <AnimatePresence>
        {showVerifying && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              left: '50%',
              top: origin.y + 38,
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 12,
              color: '#F15A22',
              whiteSpace: 'nowrap',
              letterSpacing: '0.05em',
            }}
          >
            {verifyText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Access granted text */}
      <AnimatePresence>
        {showGranted && (
          <motion.div
            key="granted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              left: '50%',
              top: origin.y + 38,
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-ibm-plex-mono)',
              fontSize: 12,
              color: '#22C55E',
              whiteSpace: 'nowrap',
              letterSpacing: '0.05em',
            }}
          >
            {grantedText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2 — Canvas rings */}
      {showRings && (
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, display: 'block' }}
        />
      )}

      {/* Phase 3 — Light cross */}
      {showCross && (
        <>
          {/* Upward beam */}
          <motion.div
            initial={{ height: 0, opacity: 1 }}
            animate={{ height: '50vh', opacity: [1, 1, 0] }}
            transition={{ duration: 0.3, times: [0, 0.6, 1] }}
            style={{
              position: 'absolute',
              left: origin.x - 1,
              bottom: '50%',
              width: 2,
              background: 'linear-gradient(to top, #F15A22, transparent)',
              boxShadow: '0 0 12px #F15A22',
              transformOrigin: 'bottom center',
            }}
          />
          {/* Downward beam */}
          <motion.div
            initial={{ height: 0, opacity: 1 }}
            animate={{ height: '50vh', opacity: [1, 1, 0] }}
            transition={{ duration: 0.3, delay: 0.05, times: [0, 0.6, 1] }}
            style={{
              position: 'absolute',
              left: origin.x - 1,
              top: '50%',
              width: 2,
              background: 'linear-gradient(to bottom, #F15A22, transparent)',
              boxShadow: '0 0 12px #F15A22',
              transformOrigin: 'top center',
            }}
          />
          {/* Horizontal beam */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.3, delay: 0.25 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 2,
              marginTop: -1,
              background: 'linear-gradient(90deg, transparent, #F15A22 30%, #F15A22 70%, transparent)',
              boxShadow: '0 0 16px #F15A22',
            }}
          />
        </>
      )}

      {/* White flash */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.04 }}
            style={{ position: 'absolute', inset: 0, background: '#fff' }}
          />
        )}
      </AnimatePresence>

      {/* Phase 4 — Vertical wipe + sweep line + heartbeat */}
      {showWipe && (
        <>
          {/* Dark panel slides down, revealing dashboard from top */}
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.8, ease: 'linear', delay: 0.04 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#0D0D0D',
              transformOrigin: 'top center',
            }}
          />
          {/* Orange sweep line follows the wipe edge */}
          <motion.div
            initial={{ top: 0 }}
            animate={{ top: '100%' }}
            transition={{ duration: 0.8, ease: 'linear', delay: 0.04 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 4,
              background:
                'linear-gradient(90deg, transparent, #F15A22 20%, #F15A22 80%, transparent)',
              boxShadow: '0 0 24px #F15A22, 0 0 48px rgba(241,90,34,0.5)',
            }}
          />
          {/* Heartbeat pulse */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.12, 0, 0] }}
            transition={{ duration: 1.2, times: [0, 0.65, 0.73, 0.85, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(241,90,34,0.12)',
            }}
          />
        </>
      )}
    </div>
  );
}
