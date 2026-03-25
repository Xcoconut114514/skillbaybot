'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface SuccessAnimationProps {
  isVisible: boolean;
  points: number;
  onComplete: () => void;
}

export function SuccessAnimation({ isVisible, points, onComplete }: SuccessAnimationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-success-50 dark:bg-success-900/20 rounded-2xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>
            <h3 className="text-2xl font-bold text-success mb-2">验证成功！</h3>
            <p className="text-xl text-warning font-semibold">+{points} 积分</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
