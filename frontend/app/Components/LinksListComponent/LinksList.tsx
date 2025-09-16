"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import MainBtn from "../Buttons/MainBtn";

const tools = [
  {
    link: "/similarity-matcher",
    title: "Inquiry Assessor",
    description:
      "Select a project and find the top 5 similar past query to your new inquiry, with match percentages.",
  },
  {
    link: "/teacher-assistant",
    title: "teacher-assistant scripter",
    description:
      "Write test cases that align with TeacherAssistant documentation.",
  },
];

export default function LinksList() {
  return (
    <div className="w-full flex flex-col justify-center">
      <ul className="flex items-center justify-center gap-10 flex-wrap w-full">
        {tools.map((tool, idx) => (
          <li key={idx}>
            <Link
              key={idx}
              href={tool.link}
              className="p-10 flex justify-center flex-col gap-5 bg-blue rounded-lg transition-transform duration-200 hover:scale-95 active:scale-90 w-[300px] h-[300px] hover:shadow-2xl"
            >
              <h1 className="text-xl text-white font-bold">{tool.title}</h1>
              <p className="text-black border-1 px-3 py-0.5 bg-white rounded-xl inline-block text-sm font-semibold border-white w-fit">
                Ai Tool
              </p>
              <p className="text-white">{tool.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
