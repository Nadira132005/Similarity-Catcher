"use client";
import React, { useEffect, useState } from "react";
import {
  getStatus,
  compareQuery,
  SimilarityMatch,
} from "../../../api/similarityMatcher";

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

export default function SimilarityMatcher() {
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError({
          message: "Please select a CSV file.",
          status: true,
          className: "bg-red-500",
        });
        return;
      }
      setSelectedFile(file);
      setError({ message: "", status: false, className: "" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError({ message: "", status: false, className: "bg-red-500" });
    setResults([]);
    setProgress(0);
    setDone(false);

    if (!query) {
      setError({
        message: "Please provide a new inquiry.",
        status: true,
        className: "bg-red-500",
      });
      return;
    }

    if (!selectedFile) {
      setError({
        message: "Please upload a CSV file.",
        status: true,
        className: "bg-red-500",
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload the CSV file and create a temporary project
      const projectName = `temp_project_${Date.now()}`;
      const uploadFormData = new FormData();
      uploadFormData.append("csv_file", selectedFile);
      uploadFormData.append("project_name", projectName);

      const uploadResponse = await fetch(
        "http://localhost:8000/api/similarity-matcher/createProject",
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload CSV file");
      }

      setProgress(50);

      // Step 2: Compare query against the uploaded project
      const data = await compareQuery(query, USER_ID, [projectName]);

      if (data.top_matches) {
        setResults(data.top_matches);
        setDone(true);
      } else if (data.request_id) {
        const status = await getStatus(data.request_id);
        setResults(status.top_matches || []);
        setDone(true);
      } else {
        throw new Error("Unexpected response from server.");
      }

      setProgress(100);
      console.log("Results:", data.top_matches || data);
    } catch (err: any) {
      setError({
        message: err.message || "Unknown error occurred.",
        status: true,
        className: "bg-red-500",
      });
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
              <label className="font-semibold text-sm text-blue">
                Upload CSV File
              </label>
              <span className="text-xs text-gray-600 mb-1">
                Select a CSV file containing previous inquiries.
              </span>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className="block rounded px-4 py-2 font-semibold shadow cursor-pointer text-center bg-blue text-white hover:scale-95 active:scale-90 transition-transform duration-200"
                >
                  {selectedFile ? selectedFile.name : "Choose CSV File"}
                </label>
              </div>
            </div>
            <div className="relative group">
              <button
                type="submit"
                className={`rounded px-4 py-2 font-semibold shadow transition mt-1 mb-0 relative min-w-[180px] ${
                  !selectedFile || !query
                    ? "bg-slate-200 text-gray-400 cursor-not-allowed"
                    : `bg-blue text-white cursor-pointer hover:scale-95 active:scale-90 ${
                        loading ? "animate-pulse" : ""
                      }`
                }`}
                disabled={loading || !selectedFile || !query}
              >
                {loading ? `Comparing...` : "Find Top 5 Matches"}
              </button>
              {/* Tooltip for missing fields - only when button is disabled and hovered */}
              {(!selectedFile || !query) && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                  {!selectedFile && !query
                    ? "Please upload a CSV file and provide a new inquiry."
                    : !selectedFile
                    ? "Please upload a CSV file."
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
            <h2
              className="text-lg font-semibold mb-4 text-center"
              style={{ color: blue }}
            >
              Top 5 Matches
            </h2>
            <ul className="space-y-4 ">
              {results.map((r, i) => (
                <li
                  onClick={() => handleOpenModal(r)}
                  key={i}
                  className="rounded-xl p-4 shadow-md flex flex-col gap-2 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">
                        {r.content}
                      </p>
                    </div>
                    <span className="text-lg text-blue font-bold whitespace-nowrap">
                      {Number(r.match * 100).toFixed(2)}%
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
                  Match Details
                </h1>
                <span className="px-3 py-1 bg-accent text-white rounded text-sm font-semibold">
                  {Number(selectedResult.match * 100).toFixed(2)}% Match
                </span>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-blue mb-3">
                  Your Inquiry
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">{query}</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-blue mb-3">
                  Matched Entry from CSV
                </h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedResult.content}
                  </p>
                </div>
              </div>

              {selectedResult.metadata && Object.keys(selectedResult.metadata).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-blue mb-3">
                    Additional Information
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Object.entries(selectedResult.metadata).map(([key, value]) => (
                      <p key={key} className="text-gray-700 mb-1">
                        <strong className="text-blue">{key}:</strong> {value}
                      </p>
                    ))}
                  </div>
                </div>
              )}
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
