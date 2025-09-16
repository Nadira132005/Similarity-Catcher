import React from "react";
import { motion } from "motion/react";

export default function BackButton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
      onClick={() => {
        window.location.href = "/";
      }}
      className={`rounded flex items-center justify-center gap-2 px-4 py-2 fixed top-6 left-6  font-semibold shadow transition text-center mt-1 text-white bg-blue h-[40px] z-10 duration-200 hover:scale-95 active:scale-90`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      <p>Go back</p>
    </motion.div>
  );
}
