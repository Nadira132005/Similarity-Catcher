"use client";
import React, { useEffect, useState } from "react";
import {
  getStatus,
  compareQuery,
  SimilarityMatch,
} from "../../../api/similarityMatcher";

import MultiSelectDropdown from "../DropDowns/DropDown";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import MainBtn from "../Buttons/MainBtn";
import Alert from "../CustomAlert/CustomAlert";
import BackButton from "../Buttons/BackButton";
import Modal from "../Modal/ModalPrev";
const blue = "#0033A0";
const blueLight = "#e6eaf6";
const accent = "#00b5e2";

const USER_ID = 1; // Placeholder user ID

type SimilarityMatcherProps = {
  projects: string[];
};

export default function SimilarityMatcher({
  projects,
}: SimilarityMatcherProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [results, setResults] = useState<SimilarityMatch[]>([]);
  const [error, setError] = useState({
    message: "",
    status: false,
    className: "",
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const [done, setDone] = useState(false);
  const [modal, setModal] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<
    SimilarityMatch | undefined
  >(undefined);
  const [aiSummary, setAiSummary] = useState<string>("");

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  function handleSelectedChange(newSelected: string[]) {
    setSelectedProjects(newSelected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError({ message: "", status: false, className: "bg-red-500" });
    setResults([]);
    setProgress(0);
    setDone(false);
    console.log(selectedProjects);

    if (!query) {
      setError({
        message: "Please provide a new inquiry.",
        status: true,
        className: "bg-red-500",
      });
      return;
    }

    if (selectedProjects.length < 1) {
      setError({
        message: "Please select a project",
        status: true,
        className: "bg-red-500",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await compareQuery(query, USER_ID, selectedProjects);

      if (data.top_matches) {
        setResults(data.top_matches);
        setDone(true);
        setAiSummary(data.summary);
      } else if (data.request_id) {
        const status = await getStatus(data.request_id);
        setResults(status.top_matches || []);
        setAiSummary(data.summary);
        setDone(true);
      } else {
        throw new Error("Unexpected response from server.");
      }

      console.log("Results:", data.top_matches || data);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenModal(result: any) {
    setSelectedResult(result);
    setModal(true);
  }

  function handleCloseModal() {
    setModal(false);
    setSelectedResult(undefined);
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6"
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
            Similarity Matcher
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
                Upload a CSV of previous query and enter a new inquiry. The app
                will use AI to find and display the top 5 most similar previous
                query.
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
              New Inquiry
            </label>
            <span className="text-xs text-gray-600 mb-1">
              Paste the description of the new inquiry you want to compare.
            </span>
            <textarea
              placeholder="Paste new inquiry here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded px-3 py-2 min-h-[80px] bg-white focus:outline-none transition border-2 border-accent focus:ring-2 focus:ring-accent"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex flex-row gap-2 items-end"
          >
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex  justify-between items-end gap-2">
                <MultiSelectDropdown
                  projects={projects}
                  selectedOptions={selectedProjects}
                  onSelectionChange={handleSelectedChange}
                ></MultiSelectDropdown>
              </div>
            </div>
            <div className="relative group">
              <button
                type="submit"
                className={`rounded px-4 py-2 font-semibold shadow transition mt-1 mb-0 relative min-w-[180px] ${
                  !selectedProjects || !query
                    ? "bg-slate-200 text-gray-400 cursor-not-allowed"
                    : `bg-blue text-white cursor-pointer hover:scale-95 active:scale-90 ${
                        loading ? "animate-pulse" : ""
                      }`
                }`}
                disabled={loading || !selectedProjects || !query}
              >
                {loading ? `Comparing...` : "Find Top 5 Matches"}
              </button>
              {/* Tooltip for missing fields - only when button is disabled and hovered */}
              {(!selectedProjects || !query) && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                  {!selectedProjects && !query
                    ? "Please provide both a project name and a new inquiry."
                    : !selectedProjects
                    ? "Please provide a project name."
                    : "Please provide a new inquiry."}
                </span>
              )}
            </div>
          </motion.div>
        </form>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 200 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="mt-16"
          >
            <h2 className="mb-2 text-center"> ✨ AI Generated Summary </h2>
            <div
              style={{ whiteSpace: "pre-wrap" }}
              className="mb-6 bg-white p-4 rounded-lg shadow"
            >
              {aiSummary}
            </div>
            <h2
              className="text-lg font-semibold mb-2 text-center"
              style={{ color: blue }}
            >
              Top 5 Matches
            </h2>
            <ul className="space-y-4 ">
              {results.map((r, i) => (
                <li
                  onClick={() => handleOpenModal(r)}
                  key={i}
                  className="rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm text-blue font-semibold break-words line-clamp-3">
                      {r.metadata?.summary}
                    </p>

                    {r.metadata?.created_date && (
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {r.metadata.created_date}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end text-right">
                    <span className="text-sm text-blue font-bold">
                      Match: {Number(r.match * 100).toFixed(2) || "N/A"}%
                    </span>
                    <span className="text-xs font-medium text-black">
                      Project Name: {r.project_name}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <Modal show={modal} onClose={handleCloseModal}>
          {selectedResult && (
            <div className="flex flex-col gap-6 text-black">
              {/* Header */}
              <div className="border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-blue mb-2">
                  Inquiry Details
                </h1>
                <div className="flex items-start gap-2 flex-col">
                  <span className="text-sm text-gray-500">
                    Created: {selectedResult.metadata?.created_date}
                  </span>
                  <span className="px-3 py-1 bg-accent text-white rounded text-sm font-semibold">
                    {Number(selectedResult.match * 100).toFixed(2) || "N/A"}%
                    Match
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-blue mb-3">
                  Summary
                </h2>
                <p className="text-gray-800 leading-relaxed">
                  {Object.entries(selectedResult.metadata || {}).map(
                    ([key, value]) => (
                      <span key={key} className="block">
                        <strong>{key}:</strong> {value}
                      </span>
                    )
                  )}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-blue mb-3">
                  Inquiry
                </h2>
                <p className="text-gray-800 leading-relaxed">{query}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-blue mb-3">
                  Description
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedResult.metadata?.description}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue">
                <h3 className="font-semibold text-blue mb-1">
                  Project Information
                </h3>
                <p className="text-gray-700">
                  <strong>Project Name:</strong> {selectedResult.project_name}
                </p>
                <p className="text-gray-700">
                  <strong>Inquiry ID:</strong> {selectedResult.id}
                </p>
              </div>
            </div>
          )}
        </Modal>

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
      >
        <button
          aria-label="Backend API Links"
          onClick={() =>
            (window.location.href = "/similarity-matcher/upload-csv")
          }
          className="ml-4 p-2 rounded-full hover:bg-blue  border border-gray-300 flex items-center justify-center bg-[#fff] group cursor-pointer transition-transform hover:scale-95 active:scale-90"
        >
          {/* Gear icon SVG */}
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="#0033a0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            className="transition-colors duration-200 group-hover:stroke-white hover:scale-95 active:scale-90"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 11 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </motion.footer>
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
    </main>
  );
}
