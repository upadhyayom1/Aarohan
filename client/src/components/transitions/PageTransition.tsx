import React, { ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface PageTransitionProps {
  children: ReactNode;
  routeKey: string;
  className?: string;
}

/**
 * Enterprise Page Transition
 * - Fast, subtle opacity and gentle vertical translation (4px)
 * - Controlled duration (160ms enter, 110ms exit)
 * - Preserves persistent layout shells without unwanted re-renders
 * - Respects OS prefers-reduced-motion
 */
export function PageTransition({
  children,
  routeKey,
  className = 'flex-1 flex flex-col w-full',
}: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 4,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.05 : 0.16,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -4,
      transition: {
        duration: shouldReduceMotion ? 0.05 : 0.11,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Tab Content Transition
 * Smoothly transitions tab panels without flashing or jumping scroll position.
 */
export function TabTransition({
  children,
  activeTab,
  className = 'w-full',
}: {
  children: ReactNode;
  activeTab: string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 3 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: shouldReduceMotion ? 0.05 : 0.14,
            ease: [0.16, 1, 0.3, 1],
          },
        }}
        exit={{
          opacity: 0,
          y: shouldReduceMotion ? 0 : -3,
          transition: {
            duration: shouldReduceMotion ? 0.05 : 0.09,
          },
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Subtle Crossfade Transition for dynamic in-situ state changes
 */
export function FadeTransition({
  children,
  transitionKey,
  className = '',
}: {
  children: ReactNode;
  transitionKey: string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: shouldReduceMotion ? 0.05 : 0.14 },
        }}
        exit={{
          opacity: 0,
          transition: { duration: shouldReduceMotion ? 0.05 : 0.1 },
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

