import React from "react";
import { motion } from "motion/react";
type AlertProps = {
  message: string;
  className?: string;
  onClose: () => void;
};

export default function Alert({ message, onClose, className }: AlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0 }}
      transition={{ duration: 0.3, type: "spring" }}
      className={`fixed top-4 px-4 py-2 rounded shadow-lg text-white z-50 flex items-center justify-between w-64  ${className}`}
    >
      <span>{message}</span>
      <button className="ml-4 font-bold text-xl " onClick={onClose}>
        ×
      </button>
    </motion.div>
  );
}
