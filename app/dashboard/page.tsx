'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardScreen from '@/components/screens/Dashboard';
import { usePageTransition } from '@/context/TransitionContext';

export default function DashboardPage() {
  const { wasConnectTransition, triggerBoot } = usePageTransition();

  useEffect(() => {
    if (!wasConnectTransition) triggerBoot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      key="dashboard"
      className="h-full"
      initial={wasConnectTransition ? { opacity: 1 } : { opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      transition={{ duration: wasConnectTransition ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <DashboardScreen />
    </motion.div>
  );
}
