"use client";

import { motion } from 'framer-motion';

export default function Test() {
  console.log('Test component rendering');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        className="w-16 h-16 bg-blue-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity }}
        onAnimationStart={() => console.log('Animation started')}
        onAnimationComplete={() => console.log('Animation complete')}
      />
    </div>
  );
}