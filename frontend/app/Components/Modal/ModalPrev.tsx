"use client";
import React from "react";
import { AnimatePresence, delay, motion } from "framer-motion";
import { ReactNode } from "react";

type PropsType = {
  show: boolean;
  onClose: () => void;
  children: ReactNode;
};

const Modal = ({ show, onClose, children }: PropsType) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 500, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            exit={{ y: 500, opacity: 0 }}
            className="relative bg-white rounded-xl p-6  w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              initial={{ x: 500, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", duration: 1 }}
              className="absolute w-10 h-10 top-2 right-5 text-4xl text-black p-2 rounded-full hover:text-red-600 z-10"
              onClick={onClose}
            >
              &times;
            </motion.button>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
              className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
