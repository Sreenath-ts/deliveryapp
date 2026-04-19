import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function SuccessModal({ isOpen, onClose, message = 'Added successfully!' }) {
  const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
  };

  const modal = {
    hidden: { opacity: 0, scale: 0.8, y: -20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div className="absolute inset-0 bg-black" onClick={onClose} />
          <motion.div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-11/12 max-w-md relative z-10" variants={modal}>
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={onClose}>
              <X size={20} />
            </button>
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-green-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
              <p className="text-gray-600 text-center">Your product has been added.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
