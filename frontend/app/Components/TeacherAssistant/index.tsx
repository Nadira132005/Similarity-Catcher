"use client";
import React, { useState } from "react";
import Modal from "../Modal/Modal";
import CodeBox from "../Modal/CodeBox";
import { motion } from "motion/react";
import Alert from "../CustomAlert/CustomAlert";
import BackButton from "../Buttons/BackButton";
import MainBtn from "../Buttons/MainBtn";
import {
  getUnitTestsForIssue,
  ReturnedQueries,
} from "../../../api/teacherAssisatnt";
const blue = "#0033A0";
const blueLight = "#e6eaf6";
const accent = "#00b5e2";

export default function TeacherAssistant() {
  const [modal, setModal] = useState<boolean>(false);
  const [testDescription, setTestDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [query, setQueries] = useState<ReturnedQueries>({ results: [] });
  const [error, setError] = useState({
    message: "",
    status: false,
    className: "",
  });
  const [unitTestMarkdown, setUnitTestMarkdown] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [done, setDone] = useState(false);
  const [code, setCode] = useState({
    code: ``,
    id: 2,
  });

  function handleDwonload(code: string, id: number) {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `test${id}.cs`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function handleCloseModal() {
    setModal(false);
  }

  function handleOpenModal() {
    setModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError({ message: "", status: false, className: "bg-red-500" });
    setQueries({ results: [] });
    setProgress(0);
    setDone(false);

    if (!testDescription) {
      setError({
        message: "Please provide a test description.",
        status: true,
        className: "bg-red-500",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await getUnitTestsForIssue(testDescription);

      if (data.response) {
        setUnitTestMarkdown(data.response);
        setCode({ code: data.response, id: code.id });
        setDone(true);
      } else {
        throw new Error("Unexpected response from server.");
      }

      console.log("Results:", data.response);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center "
      style={{ background: blueLight }}
    >
      {error.status && (
        <Alert
          message={error.message}
          onClose={() =>
            setError({ message: "", status: false, className: "" })
          }
          className={error.className}
        ></Alert>
      )}
      <BackButton></BackButton>
      <div className="w-full max-w-lg p-0">
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="flex items-center justify-between mb-6"
        >
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: blue }}
          >
            TeacherAssistant Scripter
          </h1>
          <div
            className="relative group"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="inline-block w-7 h-7 rounded-full text-center font-bold cursor-pointer border-2 transition   shadow-sm border-blue text-blue hover:bg-blue hover:text-white hover:shadow-lg">
              ?
            </span>
            {showTooltip && (
              <div className="absolute right-0 top-10 z-10 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm text-gray-700 animate-fade-in">
                Upload a test case description, and the app will automatically
                generate C# test code using the teacher-assistant library
                documentation.
              </div>
            )}
          </div>
        </motion.div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-transparent"
        >
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex flex-col gap-1"
          >
            <label className="font-semibold text-sm text-blue">
              Test description
            </label>
            <span className="text-xs text-gray-600 mb-1">
              Paste the description of the test you want to generate.
            </span>
            <textarea
              placeholder="Paste test description here..."
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              className="rounded px-3 py-2 min-h-[80px] bg-white focus:outline-none transition border-2 border-accent focus:ring-2 focus:ring-accent"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex flex-row gap-2 items-end"
          >
            <div className="relative group">
              <button
                type="submit"
                className={`rounded px-4 py-2 font-semibold shadow transition mt-1 mb-0 relative min-w-[180px] ${
                  !testDescription
                    ? "bg-slate-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue text-white cursor-pointer hover:scale-95 active:scale-90"
                }`}
                disabled={loading || !testDescription}
              >
                {loading
                  ? progress !== null
                    ? `Generating... ${progress}%`
                    : "Generating..."
                  : "Generate test"}
              </button>
              {/* Tooltip for missing fields - only when button is disabled and hovered */}
              {!testDescription && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                  {"Please provide a description."}
                </span>
              )}
            </div>
          </motion.div>
        </form>
        {unitTestMarkdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="mt-8"
          >
            <div className="space-y-4">
              <div className="rounded-xl p-4 shadow-md flex flex-col gap-2 bg-blue-50">
                <h2
                  className="text-lg font-semibold mb-2 text-center"
                  style={{ color: blue }}
                >
                  Test Case
                </h2>
                <p className="">
                  Automatically generate relevant test cases from your project
                  requirements to save time and improve accuracy.
                </p>
                <div className="flex w-full items-center justify-center gap-3">
                  <MainBtn classname={"w-1/2"} onClick={handleOpenModal}>
                    Preview code
                  </MainBtn>
                  <MainBtn
                    onClick={() => handleDwonload(code.code, code.id)}
                    classname={"flex items-center w-1/2 justify-center gap-2"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                      />
                    </svg>
                    Download File
                  </MainBtn>
                </div>
              </div>
            </div>
            {/* 
            <ul className="space-y-4 ">
              {results.map((r, i) => (
                <li
                  key={i}
                  className="rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 bg-blue-50"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-blue-800 break-words">
                      {r.content}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end text-right">
                    <span className="text-sm text-blue font-bold">
                      Match:{" "}
                      {typeof r.match === "number"
                        ? r.match.toFixed(2)
                        : typeof r.match_percentage === "number"
                        ? r.match_percentage.toFixed(2)
                        : "N/A"}
                      %
                    </span>
                    <span className="text-xs font-medium text-black">
                      Project Name: {r.project_name}
                    </span>
                  </div>
                </li>
              ))}
            </ul> */}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 200 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-full mt-4"
        >
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress ?? 0}%`,
                background: done ? "#22c55e" : accent,
                transition: "width 0.3s",
              }}
            ></div>
          </div>
          <div
            className="text-center text-xs mt-1 font-semibold"
            style={{ color: done ? "#22c55e" : blue }}
          >
            {done ? "Done!" : `Processing: ${progress ?? 0}%`}
          </div>
        </motion.div>
      </div>
      <motion.footer
        initial={{ opacity: 0, y: 200 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="mt-8 text-gray-500 text-xs flex items-center justify-center gap-2"
      ></motion.footer>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <Modal onClose={handleCloseModal} show={modal}>
        <CodeBox code={unitTestMarkdown} language={"csharp"}></CodeBox>
      </Modal>
    </main>
  );
}
