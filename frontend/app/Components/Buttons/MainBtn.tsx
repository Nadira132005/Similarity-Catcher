"use client";
import { motion } from "motion/react";
import React from "react";

type MainBtnProps = {
  onClick?: () => void;
  children?: React.ReactNode;
  classname?: string;
  topBtn?: boolean;
};

export default function MainBtn({
  onClick,
  children,
  classname,
  topBtn,
}: MainBtnProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: topBtn ? -100 : 0, scale: 0 }}
      animate={{ opacity: 1, y: topBtn ? 0 : 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
      onClick={onClick}
      className={`rounded px-4 py-2 font-semibold shadow  cursor-pointer text-center mt-1 text-white bg-blue h-[40px] transition-transform duration-200 hover:scale-95 active:scale-90 z-10 ${classname}`}
      aria-label={`${children}`}
    >
      {children}
    </motion.button>
  );
}
